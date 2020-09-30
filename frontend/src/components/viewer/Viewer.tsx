import React from 'react';
import WebsocketClient from '../../ws_client';

interface ViewerState {
  ws_connected: boolean,
  view: any,
}

class Viewer extends React.Component<{}, ViewerState> {
  ws: WebsocketClient;

  constructor(props: {}) {
    super(props);

    let backendAddress = 'localhost:8081';

    // append ?raspi to the URL to enable the raspberry ip
    if (window.location.search.includes('raspi')) {
      backendAddress = '10.255.255.1:8081';
    }

    this.ws = new WebsocketClient("ws:" + backendAddress, "viewer");

    this.state = {
      ws_connected: false,
      view: { screen: "empty" },
    };
  }

  componentDidMount() {
    this.ws.connect().then(() => {
      this.setState({ ws_connected: true });

      const setView = (resp: any) => {
        this.setState({ view: resp });
      };

      this.ws.send_message("get_viewer_view", {}, 500).then(setView);

      this.ws.on("view_update", setView);
    }).catch((err: {}) => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    this.ws.closeConnection();
  }

  render() {
    if (this.state.view.screen === "empty") {
      return (<p>Please wait for Game Master.</p>);
    }

    if (this.state.view.screen === "matrix") {
      const columns = this.state.view.categories.map((c: any, i: number) => (
        <React.Fragment key={i}>
          <div className={`flex items-center justify-center col-span-1 row-span-1 rounded-md border-2 border-gray-700`}>
            <span className="font-bold text-2xl">
              { c.name }
            </span>
          </div>
          {c.answers.map((a: any, j: number) => (
            <div
              key={j}
              className={`flex items-center justify-center col-span-1 row-span-1 rounded-md border-2 border-gray-700`}
              style={a.finished ? {color: '#666'} : undefined}
            >
              <span className="text-xl">
                { a.points }
              </span>
            </div>
          ))}
        </React.Fragment>
      ));

      return (
        <>
          <div className={
            `flex-auto m-4 grid grid-flow-col gap-4 grid-cols-${this.state.view.categories.length} grid-rows-6`
          }>
            {columns}
          </div>
          <footer className="flex-initial h-16 bg-teal-800 flex flex-wrap items-center text-center">
            { this.state.view.players.map((p: any, i: number) => {
              return (
                <span
                  key={i}
                  className={`mx-2 p-1 min-w-64 rounded-md ${p.active ? 'bg-teal-400' : 'bg-teal-900'} border border-gray-600 text-lg`}
                  style={p.buzzerDown ? {color: 'red'} : undefined}
                >
                  Team {p.name}: {p.points} points
                </span>
              );
            })}
          </footer>
        </>
      );
    }

    if (this.state.view.screen === "answer") {
      const {answer: {type, content, points}, firstPlayer} = this.state.view;

      const shared = (
        <>
          <p>Points: {points}</p>
          {
            firstPlayer ?
              <p>Erster: {firstPlayer.name}</p>
            :
              null
          }
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

export default Viewer;
