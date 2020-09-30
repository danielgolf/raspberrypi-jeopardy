const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const { shuffle } = require("./util.js");

const backupPath = "./backup/";

class Jeopardy {
  constructor(categoryReader, getButtonState) {
    this.categoryReader = categoryReader;
    this.getButtonState = getButtonState;

    this.state = {
      started: false,
    };
  }

  start(playerNames, categorie_names) {
    if (!Array.isArray(categorie_names)) {
      // select random categories
      let number_categories = 3;
      if (!isNaN(categorie_names)) {
        number_categories = parseInt(categorie_names);
      }
      categorie_names = shuffle(this.categoryReader.getCategoryNames());
      categorie_names.splice(number_categories, Infinity);
    }

    this.state.categories = categorie_names.map((name) => ({
      name,
      answers: this.categoryReader
        .getCategoryByName(name)
        .selectRandomAnswersPerLevel(),
    }));

    this.state.players = playerNames.map((name, i) => {
      return {
        uuid: uuidv4(),
        name,
        buttonID: i,
        points: 0,
      };
    });

    this.state.lastWinningPlayerID = this.selectRandomPlayer().uuid;
    this.state.activeAnswer = null;
    this.state.answeringPlayer = null;

    this.state.started = true;
    this.state.uuid = uuidv4();
  }

  getPlayer(playerUUID) {
    for (let player of this.state.players) {
      if (player.uuid === playerUUID) {
        return player;
      }
    }
    return null;
  }

  getCategory(name) {
    for (let category of this.state.categories) {
      if (category.name === name) {
        return category;
      }
    }
    return null;
  }

  selectRandomPlayer() {
    return this.state.players[
      Math.floor(this.state.players.length * Math.random())
    ];
  }

  selectAnswer(id) {
    if (this.state.activeAnswer || !this.state.started) {
      return false;
    }

    for (const category of this.state.categories) {
      const answer = category.answers.find((el) => el.id === id);
      if (answer) {
        this.state.activeAnswer = answer;
        if (this.state.activeAnswer.finished) {
          this.state.activeAnswer = null;
          return false;
        }
        return true;
      }
    }

    return false;
  }

  processQuestion(accept) {
    if (!this.state.activeAnswer || !this.state.answeringPlayer) {
      return false;
    }

    this.state.activeAnswer.finished = true;
    if (accept) {
      this.state.answeringPlayer.points += this.state.activeAnswer.points;
      this.state.activeAnswer.wonBy = this.state.answeringPlayer.uuid;
      this.state.activeAnswer = null;
      this.state.lastWinningPlayerID = this.state.answeringPlayer.uuid;
    } else {
      this.state.activeAnswer.bannedPlayers =
        this.state.activeAnswer.bannedPlayers ?? [];
      this.state.activeAnswer.bannedPlayers.push(
        this.state.answeringPlayer.uuid
      );
    }

    this.state.answeringPlayer = null;
    return true;
  }

  cancelAnswer() {
    if (!this.state.activeAnswer) {
      return false;
    }

    this.state.activeAnswer = null;
    this.state.answeringPlayer = null;
    return true;
  }

  finishAnswer() {
    if (!this.state.activeAnswer) {
      return false;
    }

    this.state.activeAnswer.finished = true;
    this.cancelAnswer();

    // select a new player
    this.state.lastWinningPlayerID = this.selectRandomPlayer().uuid;
    return true;
  }

  getPlayerBy(buttonID) {
    if (!this.state.started) {
      return null;
    }
    for (let player of this.state.players) {
      if (player.buttonID === buttonID) {
        return player;
      }
    }
    return null;
  }

  buttonPressedByPlayer(buttonID) {
    if (!this.state.activeAnswer) {
      return false;
    }
    const answeringPlayer = this.getPlayerBy(buttonID);
    if (answeringPlayer === null) {
      return false;
    }
    if (this.state.activeAnswer.hasOwnProperty("bannedPlayers")) {
      const answeredByPlayer = this.state.activeAnswer.bannedPlayers.includes(
        answeringPlayer.uuid
      );
      if (answeredByPlayer) {
        return false;
      }
    }
    this.state.answeringPlayer = answeringPlayer;
    return true;
  }

  save() {
    fs.mkdirSync(path.join(backupPath), { recursive: true });
    let data = JSON.stringify(this.state);
    fs.writeFileSync(path.join(backupPath, `${this.uuid}.json`), data);
  }

  getView() {
    const getAnswerView = (a) => ({
      type: a.type,
      content: a.content || a.text || a.uri,
      points: a.points,
    });

    if (!this.state.started) {
      return {
        screen: "empty",
      };
    }

    if (!this.state.activeAnswer) {
      const buttonState = this.getButtonState();

      return {
        screen: "matrix",
        categories: this.state.categories.map((c) => ({
          name: c.name,
          answers: c.answers.map((a) => ({
            points: a.points,
            finished: a.finished,
          })),
        })),
        players: this.state.players.map((p, i) => ({
          name: p.name,
          points: p.points,
          active: this.state.lastWinningPlayerID === p.uuid,
          buzzerDown: buttonState[i],
        })),
      };
    }

    return {
      screen: "answer",
      answer: getAnswerView(this.state.activeAnswer),
      firstPlayer: this.state.answeringPlayer
        ? {
            name: this.state.answeringPlayer.name,
          }
        : null,
    };
  }

  getGameMasterView() {
    const getAnswerView = (a) => ({
      type: a.type,
      content: a.content || a.text || a.uri,
      points: a.points,
    });

    if (!this.state.started) {
      return {
        screen: "start",
        categoryNames: this.categoryReader.getCategoryNames(),
      };
    }

    if (!this.state.activeAnswer) {
      const buttonState = this.getButtonState();

      return {
        screen: "matrix",
        categories: this.state.categories.map((c) => ({
          name: c.name,
          answers: c.answers.map(({id, points, finished}) => ({
            id,
            points,
            finished,
          })),
        })),
        players: this.state.players.map((p, i) => ({
          name: p.name,
          points: p.points,
          active: this.state.lastWinningPlayerID === p.uuid,
          buzzerDown: buttonState[i],
        })),
      };
    }

    return {
      screen: "answer",
      answer: getAnswerView(this.state.activeAnswer),
      firstPlayer: this.state.answeringPlayer
        ? {
            name: this.state.answeringPlayer.name,
          }
        : null,
      question: this.state.activeAnswer.question,
    };
  }
}

module.exports = Jeopardy;
