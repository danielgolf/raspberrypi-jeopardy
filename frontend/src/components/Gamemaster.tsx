import React from 'react';
import WebsocketClient from '../ws_client';

interface GamemasterState {
  wsConnected: boolean,
}

class Gamemaster extends React.Component<any, GamemasterState> {
  ws: WebsocketClient;

  constructor(props: any) {
    super(props);

    let backendAddress = 'localhost:8081';

    // append ?raspi to the URL to enable the raspberry ip
    if (window.location.search.includes('raspi')) {
      backendAddress = '10.255.255.1:8081';
    }

    this.ws = new WebsocketClient("ws:" + backendAddress, "gamemaster");

    this.state = {
      wsConnected: false,
    };
  }

  componentDidMount() {
    this.ws.connect().then(() => {
      this.setState({wsConnected: true});
    }).catch((err: {}) => {
      console.error(err);
    });
  }

  componentWillUnmount() {
    this.ws.closeConnection();
  }

  render() {
    if (!this.state.wsConnected) {
      return (<p>Connecting...</p>);
    }

    return React.cloneElement(this.props.children as React.ReactElement<any>, { ws: this.ws });
  }
}

export default Gamemaster;
