class WebsocketClient {
  constructor(url, role) {
    this.url = url;
    this.role = role;

    this._current_msg_id = 0;
    this._open_requests = {};
    this._callbacks = {};

    this.connect = this.connect.bind(this);
    this._handle_message = this._handle_message.bind(this);
    this._send_response = this._send_response.bind(this);
    this.send_message = this.send_message.bind(this);
    this.on = this.on.bind(this);
  }

  connect() {
    this._ws = new WebSocket(this.url);

    return new Promise((resolve, reject) => {
      this._ws.onopen = () => {
        this.send_message("register", { role: this.role });

        this._ws.onmessage = (msg) => {
          msg = JSON.parse(msg.data);
          if (!msg.data.success) {
            reject("registration failed: " + msg.data.error);
          } else {
            this._ws.onmessage = (msg) =>
              this._handle_message(JSON.parse(msg.data));
          }
          resolve();
        };
      };

      this._ws.onclose = () => reject("websocket closed");
    });
  }

  closeConnection() {
    this._ws.close();
  }

  _handle_message(msg) {
    if (msg.type === "response") {
      const callback = this._open_requests[msg.response_to];
      if (typeof callback == "function") {
        callback(msg.data);
        delete this._open_requests[msg.response_to];
      }
      return;
    }

    if (msg.type in this._callbacks) {
      const callback = this._callbacks[msg.type];
      if (typeof callback == "function") {
        callback(msg.data, this._send_response.bind(this, msg.msg_id));
      }
    }
  }

  _send_response(msg_id, data) {
    const packet = {
      type: "response",
      msg_id: this._current_msg_id++,
      response_to: msg_id,
      data,
    };
    this._ws.send(JSON.stringify(packet));
  }

  on(type, callback) {
    this._callbacks[type] = callback;
  }

  send_message(type, data, timeout) {
    const packet = {
      type,
      msg_id: this._current_msg_id++,
      data,
    };

    this._ws.send(JSON.stringify(packet));

    if (timeout !== undefined) {
      return Promise.race([
        new Promise((_, reject) =>
          setTimeout(() => {
            delete this._open_requests[packet.msg_id];
            reject("timed out");
          }, timeout)
        ),
        new Promise((accept) => {
          this._open_requests[packet.msg_id] = accept;
        }),
      ]);
    } else {
      return Promise.resolve();
    }
  }
}

export default WebsocketClient;
