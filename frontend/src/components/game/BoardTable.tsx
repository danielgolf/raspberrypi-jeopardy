import React from 'react';

interface BoardTableProps {
  categoryNames: Array<string>,
  handleShowQuestion: (c: string, q: string) => void,
}

interface GeneralCellProps {
  color: string,
  name: string,
}

interface QuestionCellProps {
  color: string,
  points: number,
  handleClick: () => void,
}

function HeadingCell(props: GeneralCellProps) {
  const col = props.color;
  return (
    <div className={`flex items-center justify-center col-span-1 row-span-1 rounded-md border-2 border-gray-700 ${col}-700`}>
      <span className="font-bold text-2xl">
        { props.name }
      </span>
    </div>
  );
}

function QuestionCell(props: QuestionCellProps) {
  const col = props.color;
  return (
    <button
      onClick={props.handleClick}
      className={`flex items-center justify-center col-span-1 row-span-1 rounded-md border-2 border-gray-700 ${col}-800 hover:${col}-700`}
    >
      <span className="text-xl">
        { props.points }
      </span>
    </button>
  );
}

/*
function AnsweredCell(props: GeneralCellProps) {
  const col = props.color;
  return (
    <div className={`flex items-center justify-center col-span-1 row-span-1 rounded-md border-2 border-gray-700 ${col}-800`}>
      <span className="text-xl">
        { props.name }
      </span>
    </div>
  );
}
*/

function BoardTable(props: BoardTableProps) {
  const catNum = props.categoryNames.length;
  const rowArray = Array.from(Array(7).keys()).slice(1);
  const colArray = Array.from(Array(catNum + 1).keys()).slice(1);
  const colors = [
    "bg-orange", "bg-green", "bg-blue", "bg-purple", "bg-red"
  ];
  return (
    <div className={
      `flex-auto m-4 grid grid-flow-col gap-4 grid-cols-${catNum} grid-rows-6`
    }>
      {colArray.map((coli) => {
        return rowArray.map((rowi) => {
          const color = colors[(coli - 1) % colors.length];
          if (rowi === 1) {
            return (
              <HeadingCell
                key={coli + catNum * rowi}
                color={color}
                name={props.categoryNames[coli-1]}
              />
            );
          } else {
            let points = rowi * 100 - 100;
            const handleClick = () => {
              props.handleShowQuestion(
                color,
                `Question of category ${props.categoryNames[coli-1]} with ${points}`,
              );
            };
            return (
              <QuestionCell
                key={coli + catNum * rowi}
                color={color}
                points={points}
                handleClick={handleClick}
              />
            );
          }
        });
      })}
    </div>
  );
}

export default BoardTable;
