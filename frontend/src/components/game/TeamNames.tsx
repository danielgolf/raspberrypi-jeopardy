import React from 'react';

interface TeamNamesProps {
  teamNames: Array<string>,
  setTeamNames: (teamNames: Array<string>) => void,
}

interface TeamNamesState {
  visable: Array<boolean>,
}

interface NameInputProps {
  teamNumber: number,
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void,
}

function NameInput(props: NameInputProps) {
  return (
    <label className="mr-3">
      <span className="block text-gray-400 font-semibold text-sm">
        Team { props.teamNumber }
      </span>
      <input
        type="text"
        className="bg-gray-800 p-1 rounded-md w-64 border border-gray-400 mt-1"
        name="player_count"
        onInput={props.onInput}
      />
    </label>
  );
}

class TeamNames extends React.Component<TeamNamesProps, TeamNamesState> {
  constructor(props: TeamNamesProps) {
    super(props);
    let visable = [true];
    let teamNames = [""];
    for (let i = 1; i < 5; i++) {
      visable.push(false);
      teamNames.push("");
    }
    this.state = {
      visable,
    }
    this.props.setTeamNames(teamNames);
  }

  handleInput = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    let visable = this.state.visable.slice();
    let teamNames = this.props.teamNames;

    teamNames[i] = e.target.value.trim();

    // set next one visible
    if (teamNames[i] === "") {
      for (let j = i + 1; j < visable.length; j++) {
        visable[j] = false;
        teamNames[j] = "";
      }
    } else if (i + 1 < visable.length) {
      visable[i + 1] = true;
    }

    this.setState({
      visable,
    });
    this.props.setTeamNames(teamNames);
  }

  render() {
    return (
      <div className="mt-4">
        <h2 className="font-bold text-xl">Select Teamnames (max 5 Teams)</h2>
        <div className="mt-2 flex flex-wrap">
          { this.state.visable.map((vis, i) => {
            if (!vis) return null;
            return <NameInput
              key={i}
              teamNumber={i+1}
              onInput={(e) => this.handleInput(i, e)}
            />;
          })}
        </div>
      </div>
    );
  }
}

export default TeamNames;
