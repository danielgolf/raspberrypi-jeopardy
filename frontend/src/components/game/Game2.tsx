import React from 'react';
import Setup from './Setup';
import WebsocketClient from '../../ws_client';
import { withRouter } from 'react-router-dom';

interface Game2State {
  teamNames: Array<string>,
  categoryNames: Array<string>,
  selectedCategories: Array<string>,
}

class Game2 extends React.Component<any, Game2State> {
  ws: WebsocketClient;

  constructor(props: any) {
    super(props);

    this.ws = props.ws;

    const teamNames: Array<string> = [];
    const categoryNames: Array<string> = [];
    const selectedCategories: Array<string> = [];
    this.state = {
      teamNames,
      categoryNames,
      selectedCategories,
    };
  }

  componentDidMount() {
    this.ws.send_message("get_category_names", {}, 500)
    .then((resp: { categoryNames: Array<string> }) => {
      this.setState({
        ...resp,
      });
    });
  }

  setTeamNames(teamNames: Array<string>) {
    this.setState({ teamNames });
  }

  handleCheckboxChange(checked: boolean, newCat: string) {
    let selectedCategories = this.state.selectedCategories.slice();
    if (checked) {
      selectedCategories.push(newCat);
    } else {
      selectedCategories = selectedCategories.filter(cat => cat !== newCat);
    }
    this.setState({ selectedCategories });
  }

  handleStartGame() {
    let teamNames = this.state.teamNames.filter(nm => nm !== "");
    if (teamNames.length < 2) {
      alert("There should be at least two teams!");
      return;
    }
    if (this.state.selectedCategories.length < 2) {
      alert("You shoud select at least two categories!");
      return;
    }

    const startGameData = {
      teamNames: teamNames,
      selectedCategories: this.state.selectedCategories,
    }
    this.ws.send_message("start_game", startGameData, 500)
      .then((resp: any) => {
        if (resp.success) {
          this.props.history.push('/gm/view')
        } else {
          alert("Cannot start game. Backend issues!");
        }
      })
      .catch((err: object) => {
        console.error(err);
        alert("Cannot start game. Backend issues!");
      });
  }

  handleExitGame() {
    const selectedCategories: Array<string> = [];
    this.setState({ selectedCategories });
  }

  render() {
      return <Setup
        teamNames={this.state.teamNames}
        selectedCat={this.state.selectedCategories}
        categoryNames={this.state.categoryNames}
        handleStartGame={this.handleStartGame.bind(this)}
        setTeamNames={this.setTeamNames.bind(this)}
        handleCheckboxChange={this.handleCheckboxChange.bind(this)}
      />
  }
}

export default withRouter(Game2);
