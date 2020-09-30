const express = require("express");
const app = express();
const port = 8080;
const CategoryReader = require("./CategoryReader");
const WebsocketServer = require("./ws_server");
const gpio = require("./gpio");
const Jeopardy = require("./jeopardy");

const path = "../categories/";

const wss = new WebsocketServer();

const sendIndex = (_, response) => {
  response.sendFile("index.html", { root: "../frontend/build/" });
};

app.use("/", express.static("../frontend/build/"));
app.get("/edit", sendIndex);
app.get("/game", sendIndex);

const check_role = (role, action) => {
  return (data, send_response, sender_role) => {
    if (sender_role !== role) {
      send_response({
        success: false,
        error: "Unauthorized.",
      });
      return;
    }
    action(data, send_response, sender_role);
  };
};

let get_category = (categoryReader, action) => {
  return (data, send_response, sender_role) => {
    const category = categoryReader.getCategoryByName(data.category);
    if (category === null) {
      send_response({
        success: false,
        error: `Category "${data.category} not found."`,
      });
      return;
    }
    action(category, data, send_response, sender_role);
  };
};

let check_game_started = (jeopardy, action) => {
  return (data, send_response, sender_role) => {
    if (jeopardy.started) {
      send_response({
        success: false,
        error: "Game not running.",
      });
      return;
    }
    action(data, send_response, sender_role);
  };
};

app.listen(port, (err) => {
  if (err) {
    return console.error(`Can't start listening on ${port}`, err);
  }

  const categoryReader = new CategoryReader(path);
  categoryReader.loadAll();
  get_category = get_category.bind(this, categoryReader);

  const jeopardy = new Jeopardy(categoryReader, gpio.getButtonState);
  check_game_started = check_game_started.bind(this, jeopardy);

  const check_gamemaster = check_role.bind(this, "gamemaster");

  const updateViewer = () => {
    wss.send_to_gamemaster("view_update", jeopardy.getGameMasterView());
    wss.broadcast_to_viewers("view_update", jeopardy.getView());
  };

  gpio.onButtonPress((id) => {
    wss.send_to_gamemaster("button_press", {
      buttonID: id,
    });
  });

  gpio.registerStateUpdate(() => {
    updateViewer();
  });

  wss.on("get_viewer_view", (_data, send_response) => {
    send_response(jeopardy.getView());
  });

  wss.on("get_gamemaster_view", (_data, send_response) => {
    send_response(jeopardy.getGameMasterView());
  });

  wss.on(
    "mock_button_press",
    check_gamemaster((data) => {
      const buttonID = data.buttonID;
      if (buttonID >= 0 && buttonID < gpio.buttonCount) {
        gpio.mockButtonPress(buttonID);
      }
    })
  );

  // category loading
  wss.on("get_category_names", (_data, send_response) => {
    send_response({
      categoryNames: categoryReader.getCategoryNames(),
    });
  });

  wss.on("get_categories", (_data, send_response) => {
    send_response({
      categories: categoryReader.getCategoryData(),
    });
  });

  wss.on(
    "get_category_by_name",
    get_category((category, _data, send_response) => {
      send_response({
        category,
      });
    })
  );

  // catergory editing
  wss.on(
    "add_answer_to_category",
    check_gamemaster(
      get_category((category, data, send_response) => {
        send_response({
          success: true,
          position: category.addAnswer(data.points, data.answer),
        });
      })
    )
  );

  wss.on(
    "edit_answer",
    check_gamemaster(
      get_category((category, data, send_response) => {
        send_response({
          success: true,
          edited: category.editAnswer(data.points, data.index, data.answer),
        });
      })
    )
  );

  wss.on(
    "delete_answer",
    check_gamemaster(
      get_category((category, data, send_response) => {
        send_response({
          success: true,
          deleted: category.deleteAnswer(data.points, data.index),
        });
      })
    )
  );

  wss.on(
    "start_game",
    check_gamemaster((data, send_response) => {
      try {
        jeopardy.start(
          data.playerNames ?? data.teamNames, // FIXME: use playerNames in frontend
          data.selectedCategories
        );
        send_response({ success: true });
        updateViewer();
      } catch (e) {
        console.error(e);
        send_response({
          success: false,
          error: "Invalid request.",
        });
      }
    })
  );

  wss.on(
    "select_answer",
    check_gamemaster((data, send_response) => {
      const success = jeopardy.selectAnswer(data.answerID);
      send_response({ success });
      if (!success) {
        return;
      }
      waitForButton();
    })
  );

  wss.on(
    "process_question",
    check_gamemaster((data, send_response) => {
      const success = jeopardy.processQuestion(data.accept);
      send_response({ success });
      if (data.accept) {
        updateViewer();
      } else {
        waitForButton();
      }
    })
  );

  wss.on(
    "finish_answer",
    check_gamemaster((_data, send_response) => {
      const success = jeopardy.finishAnswer();
      send_response({ success });
      updateViewer();
    })
  );

  wss.on(
    "cancel_answer",
    check_gamemaster((_data, send_response) => {
      const success = jeopardy.cancelAnswer();
      send_response({ success });
      updateViewer();
    })
  );

  const waitForButton = () => {
    gpio.waitForButtonPress().then((buttonID) => {
      const invalidPress = jeopardy.buttonPressedByPlayer(buttonID);
      if (!invalidPress) {
        waitForButton();
      } else {
        updateViewer();
      }
    });
    updateViewer();
  };

  console.log(`Server is listening on ${port}`);
});
