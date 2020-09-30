import React from 'react';

interface QuestionProps {
  color: string,
  question: string,
  handleExit: () => void,
}

function Question(props: QuestionProps) {
  const col = props.color;
  return (
    <div className={`flex-auto m-4 p-4 ${col}-800 rounded-md`}>
      <h3 className="">
        { props.question }
      </h3>
      <button
        onClick={props.handleExit}
        className="p-2 mt-4 w-32 bg-black rounded-md"
      >
        Exit
      </button>
    </div>
  );
}

export default Question;
