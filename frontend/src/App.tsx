import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./components/Home";
import Viewer from "./components/viewer/Viewer";
import Gamemaster from "./components/Gamemaster";
import Game2 from "./components/game/Game2";
import Game from "./components/game/Game";

class App extends React.Component<{}, {}> {
  render() {
    return (
      <Switch>
        <Route path="/viewer" component={Viewer} />
        <Route path="/gm/start">
          <Gamemaster>
            <Game2 />
          </Gamemaster>
        </Route>
        <Route path="/gm/view">
          <Gamemaster>
            <Game />
          </Gamemaster>
        </Route>
        <Route path="/" component={Home} />
      </Switch>
    );
  }
}

export default App;
