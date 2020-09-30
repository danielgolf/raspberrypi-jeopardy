import React from 'react';
import WebsocketClient from '../../ws_client';

interface GameState {
  ws_connected: boolean,
  view: any,
}

class Game extends React.Component<any, GameState> {
  ws: WebsocketClient;

  constructor(props: any) {
    super(props);

    this.ws = props.ws;

    this.state = {
      ws_connected: false,
      view: { screen: "empty" },
    };
  }

  componentDidMount() {
    const setView = (resp: any) => {
      this.setState({ view: resp });
    };

    this.ws.send_message("get_gamemaster_view", {}, 500).then(setView);

    this.ws.on("view_update", setView);
  }

  selectAnswer(id: string) {
    this.ws.send_message("select_answer", {answerID: id}, 500);
  }

  render() {
    if (this.state.view.screen === "empty") {
      return (<p>waiting for server ...</p>);
    }

    if (this.state.view.screen === "start") {
      return (
        // LEON HERE
        <p>haha</p>
      );
    }

    if (this.state.view.screen === "matrix") {
      return (
        <>
          <h2 className='text-xl'>Categories</h2>
          {
            this.state.view.categories.map((c: any, i: number) => (
              <div key={i} className='float-left'>
                <h3 className='text-lg ml-2'>{ c.name }</h3>
                <ol className='ml-4'>
                  {c.answers.map((a: any, j: number) => (
                    <li key={j}>
                      <button
                        onClick={this.selectAnswer.bind(this, a.id)}
                        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded my-1 min-w-full'
                        style={a.finished ? {color: 'black'} : undefined}
                      >{ a.points }</button>
                    </li>
                  ))}
                </ol>
              </div>
            ))
          }
          <h2 className='text-xl clear-left'>Players</h2>
          <ol className='list-decimal ml-10'>
            {
              this.state.view.players.map((p: any, i: number) => {
                return (
                  <li
                    key={i}
                    className={p.active ? 'bg-teal-400' : 'bg-teal-900'}
                    style={p.buzzerDown ? {color: 'red'} : undefined}
                  >
                    Name: {p.name}, Points: {p.points}
                  </li>
                );
              })
            }
          </ol>
        </>
      )
    }

    if (this.state.view.screen === "answer") {
      const {answer: {type, content, points}, firstPlayer, question} = this.state.view;

      const shared = (
        <>
          <p>Question: {question}</p>
          <p>Points: {points}</p>
          {
            firstPlayer ?
              <p>Erster: {firstPlayer.name}</p>
            :
              null
          }
          <button
            onClick={() => this.ws.send_message("process_question", {accept: true}, 500)}
            className='bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mx-2'
          >Accept Answer</button>
          <button
            onClick={() => this.ws.send_message("process_question", {accept: false}, 500)}
            className='bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded mx-2'
          >Reject Answer</button>
          <button
            onClick={() => this.ws.send_message("finish_answer", {}, 500)}
            className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mx-2'
          >Finish Answer</button>
          <button
            onClick={() => this.ws.send_message("cancel_answer", {}, 500)}
            className='bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded mx-2'
          >Cancel Answer</button>
        </>
      );

      if (type === "text") {
        return (
          <>
            <h1>{content}</h1>
            {shared}
          </>
        );
      } else if (type === "image") {
        return (
          <>
            <img src={content} />
            {shared}
          </>
        );
      } else {
        return <h1>Answer type {type} not implemented!</h1>
      }
    }

    return <p>Invalid screen {this.state.view.screen}!</p>
  }
}

export default Game;
