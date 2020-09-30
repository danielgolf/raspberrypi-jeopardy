import React from 'react';
import BoardTable from './BoardTable';
import BoardFooter from './BoardFooter';
import Question from './Question';

interface QuestionProps {
  color: string,
  question: string,
}

interface BoardProps {
  categoryNames: Array<string>,
  teamNames: Array<string>,
  handleExitGame: () => void,
}

interface BoardState {
  showQuestion: QuestionProps | null,
  teamPoints: Array<number>,
  answQuest: Array<Array<string | null>>,
}

class Board extends React.Component<BoardProps, BoardState> {
  constructor(props: BoardProps) {
    super(props);

    const teamPoints = this.props.teamNames.map(_ => 0);
    const catNum = props.categoryNames.length;
    let answQuest = Array(catNum).fill(Array(5).fill(null));

    this.state = {
      showQuestion: null,
      teamPoints,
      answQuest,
    }
  }

  handleShowQuestion(color: string, question: string) {
    this.setState({
      showQuestion: {
        color,
        question,
      }
    });
  }

  resetShowQuestion() {
    this.setState({ showQuestion: null });
  }

  render() {
    let content: React.ReactNode;
    if (this.state.showQuestion) {
      content = (
        <Question
          color={this.state.showQuestion.color}
          question={this.state.showQuestion.question}
          handleExit={this.resetShowQuestion.bind(this)}
        />
      );
    } else {
      content = (
        <BoardTable
          categoryNames={this.props.categoryNames}
          handleShowQuestion={this.handleShowQuestion.bind(this)}
        />
      );
    }

    return (
      <div className="flex flex-col h-full">
        { content }
        <BoardFooter
          teamNames={this.props.teamNames}
          teamPoints={this.state.teamPoints}
          handleExitGame={this.props.handleExitGame}
        />
      </div>
    );
  }
}

export default Board;
