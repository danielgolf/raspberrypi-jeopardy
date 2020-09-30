const WebSocket = require("ws");
const autoBind = require("auto-bind");

class WebsocketServer {
    constructor(port) {
        port = port ?? 8081;
        this._wss = new WebSocket.Server({ port });
        this._gamemaster = null;
        this._viewers = [];
        this._connections = new Map();
        this._callbacks = {};

        this._current_msg_id = 0;

        autoBind(this);

        this._wss.on("connection", (ws, _req) => {
            ws.on("message", this._handle_message.bind(this, ws));
            ws.on("close", () => {
                // TODO: handle relevant client disconnects
                this._connections.delete(ws);
                if (ws == this._gamemaster) {
                    this._gamemaster = null;
                } else {
                    const idx = this._viewers.indexOf(ws);
                    if (idx != -1) {
                        this._viewers.splice(idx, 1);
                    }
                }
            });
        });
    }

    _handle_message(ws, msg) {
        try {
            msg = JSON.parse(msg);
        } catch {
            console.warn("Received non-json message.");
            return;
        }

        if (msg.type == "register") {
            const role = msg.data?.role;
            let error = null;

            if (this._connections.has(ws)) {
                error = `already registered (role: "${this._connections.get(ws).role}")`;
            } else if (role == "gamemaster") {
                if (this._gamemaster != null) {
                    error = "gamemaster role already taken";
                } else {
                    this._gamemaster = ws;
                }
            } else if (role == "viewer") {
                this._viewers.push(ws);
            } else {
                error = `Inavild role "${role}"`;
            }

            if (error == null) {
                this._connections.set(ws, { role, open_requests: {} });
                this._send_response(ws, msg.msg_id, { success: true });
            } else {
                this._send_response(ws, msg.msg_id, { success: false, error });
            }

            return;
        }

        if (!(this._connections.has(ws))) {
            return;
        }

        if (msg.type == "response") {
            const callback = this._connections.get(ws).open_requests[msg.response_to];
            if (typeof callback == "function") {
                callback(msg.data);
                delete this._connections.get(ws).open_requests[msg.response_to];
            }
            return;
        }

        if (msg.type in this._callbacks) {
            this._callbacks[msg.type](msg.data, this._send_response.bind(this, ws, msg.msg_id), this._connections.get(ws).role);
        }
    }

    _send_response(ws, msg_id, data) {
        const packet = {
            type: "response",
            msg_id: this._current_msg_id++,
            response_to: msg_id,
            data,
        };
        ws.send(JSON.stringify(packet));
    }

    _send_message(ws, type, data, timeout) {
        const packet = {
            type,
            msg_id: this._current_msg_id++,
            data,
        };

        ws.send(JSON.stringify(packet));

        if (timeout != undefined) {
            return Promise.race([
                new Promise((_, reject) =>
                    setTimeout(() => {
                        delete this._connections.get(ws).open_requests[packet.msg_id];
                        reject("timed out");
                    }, timeout)
                ),
                new Promise(accept => {
                    this._connections.get(ws).open_requests[packet.msg_id] = accept;
                }),
            ]);
        } else {
            return Promise.resolve();
        }
    }

    is_gamemaster_connected() {
        return this._gamemaster != null;
    }

    get_viewer_count() {
        return this._viewers.length;
    }

    on(type, callback) {
        this._callbacks[type] = callback;
    }

    send_to_gamemaster(type, data, response_timeout) {
        if (this.is_gamemaster_connected()) {
            return this._send_message(this._gamemaster, type, data, response_timeout);
        } else {
            return Promise.reject("gamemaster not connected");
        }
    }

    broadcast_to_viewers(type, data) {
        for (let viewer of this._viewers) {
            this._send_message(viewer, type, data);
        }
        return this._viewers.length;
    }
}

module.exports = WebsocketServer;

// // example
// let s = new WebsocketServer();

// s.on("echo", (data, send_response, sender_role) => {
//     console.log("Echo to:", sender_role);
//     send_response(data);
// });

// setInterval(() => {
//     s.broadcast_to_viewers("update", { view: "<html></html>" });
// }, 10_000);
