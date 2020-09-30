import React from 'react';

interface BoardFooterProps {
  teamNames: Array<string>,
  teamPoints: Array<number>,
  handleExitGame: () => void,
}

function BoardFooter(props: BoardFooterProps) {
  return (
    <footer className="flex-initial h-16 bg-teal-800 flex flex-wrap items-center text-center">
      <button
        className="mx-2 p-1 w-64 rounded-md bg-teal-700 hover:bg-green-600 border-2 border-gray-700 text-lg"
        onClick={props.handleExitGame}
      >
        Exit Game
      </button>
      { props.teamNames.map((tn: string, i: number) => {
        return (
          <span key={i} className="mx-2 p-1 min-w-64 rounded-md bg-teal-900 border border-gray-600 text-lg">
            Team {tn}: {props.teamPoints[i]} points
          </span>
        );
      })}
    </footer>
  );
}

export default BoardFooter;
