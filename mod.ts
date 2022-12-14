import {
  StandardWebSocketClient,
  WebSocketClient,
} from "https://deno.land/x/websocket@v0.1.4/mod.ts";

export class WebsocketBridge {
  appName: string;
  serverPort: string;
  client: WebSocketClient;
  onMessage: (message: string) => void;

  constructor(
    appName: string,
    serverPort: string,
    onMessage: (message: string) => void,
  ) {
    this.appName = appName;
    this.serverPort = serverPort;
    this.onMessage = onMessage;
    const client = new StandardWebSocketClient("ws://127.0.0.1:" + serverPort);
    this.client = client
    this.client.on("open", function () {
      console.log(
        `WebSocket Client [${appName}] connected, the server port is ${serverPort}`,
      );
      client.send(
        JSON.stringify({ "type": "client-app-name", "content": appName }),
      );
    }).on("message", function(event) {
        onMessage(event.data)
    });
  }

  messageToEmacs(message: string) {
    this.client.send(JSON.stringify({
      "type": "show-message",
      "content": message,
    }));
  }

  evalInEmacs(code: string) {
    this.client.send(JSON.stringify({
      "type": "eval-code",
      "content": code,
    }));
  }

  getEmacsVar(varName: string) {
    return new Promise((resolve, _) => {
      const client: WebSocketClient = new StandardWebSocketClient(
        "ws://127.0.0.1:" + this.serverPort,
      );
      client.on("message", function (message) {
        resolve(message["data"]);
      });

      client.on("open", function () {
        client.send(JSON.stringify({
          "type": "fetch-var",
          "content": varName,
        }));
      });
    });
  }
}    

export function bridgeAppRegist(onMessage) {
    return new WebsocketBridge(Deno.args[0], Deno.args[1], onMessage)
}
    
