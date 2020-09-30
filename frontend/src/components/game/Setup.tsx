import React from 'react';
import TeamNames from './TeamNames';

interface CategoryCheckboxProps {
  name: string,
  handleChange: (checked: boolean) => void,
}

interface SetupProps {
  teamNames: Array<string>,
  selectedCat: Array<string>,
  categoryNames: Array<string>,
  handleStartGame: () => void,
  setTeamNames: (s: Array<string>) => void,
  handleCheckboxChange: (c: boolean, nc: string) => void,
}

function CategoryCheckbox(props: CategoryCheckboxProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.handleChange(e.target.checked);
  }

  return (
    <label className="mt-1 block">
      <input
        type="checkbox"
        value={props.name}
        onChange={handleChange}
        className="form-checkbox text-purple-900 bg-gray-800 border-gray-400"
      />
      <span className="ml-2 text-gray-400 font-semibold text-sm">
        {props.name}
      </span>
    </label>
  );
}

function StartGameButton(props: { onStart(): void }) {
  return (
    <button
      className="mt-4 p-1 min-w-32 rounded-md border border-gray-500 bg-teal-900 hover:bg-teal-700"
      onClick={() => props.onStart()}
    >
      Start Game
    </button>
  );
}

function Setup(props: SetupProps) {
  const mapCategories = (catn: string) => {
    return <CategoryCheckbox
      key={catn}
      name={catn}
      handleChange={(checked: boolean) => {
        props.handleCheckboxChange(checked, catn);
      }}
    />
  }

  return (
    <div className="m-8">
      <h1 className="font-bold text-3xl">Configure a Game</h1>
      <TeamNames
        teamNames={props.teamNames}
        setTeamNames={props.setTeamNames}
      />
      <div className="mt-4">
        <h4 className="text-gray-400 font-semibold">Kategorien</h4>
        { props.categoryNames.map(mapCategories) }
      </div>
      <StartGameButton onStart={props.handleStartGame} />
    </div>
  );
}

export default Setup;
