// 🔥 steal some types from the real code
import type { Message } from '../../src/lib/messages.ts';
import type { WebviewAPI } from '../../src/webview/types/api.ts';

declare let acquireVsCodeApi: any;

declare let lintelIsReady: Promise<unknown>;
declare const lintelWebviewAPI: WebviewAPI;

type Params = {
  httpPort: number;
  keepAliveMillis: number;
  wsPort: number;
};

// 📘 injected into index.html to provide a base simulation
//     of VSCode's webview support via a socket connection to
//     the extension

export async function webview({
  httpPort,
  keepAliveMillis,
  wsPort
}: Params): Promise<any> {
  let theSocket: WebSocket = null;

  // 👇 lintelIsReady is resolved when the socket connection is open

  const { promise, resolve } = Promise.withResolvers();
  lintelIsReady = promise;

  // 👇 put the simulated VSCode API on the global namespace

  acquireVsCodeApi = (): WebviewAPI => {
    return {
      // 👇 retrieve webview state
      getState: (): any => {
        const state = {};
        let ix = 0;
        let key;
        while ((key = localStorage.key(ix++)))
          state[key] = JSON.parse(localStorage.getItem(key) ?? '{}');
        return state;
      },

      // 👇 set webview state
      setState: (state: any): void => {
        Object.keys(state).forEach((key) =>
          localStorage.setItem(key, JSON.stringify(state[key]))
        );
      },

      // 👇 post message to the simulated extension from the webview
      postMessage: (message: Message): void => {
        // 🔥 FLOW client sends message to simulator
        theSocket?.send(JSON.stringify(message));
      }
    };
  };

  // 👇 initialize the WebSocket protocol
  await fetch(`http://localhost:${httpPort}`, {
    headers: { upgrade: 'websocket' },
    mode: 'no-cors'
  });

  // 👇 now we can try to connect to the socket
  theSocket = new WebSocket(`ws://localhost:${wsPort}`);
  let wasReady = false;
  const intervalID = setInterval(() => {
    if (theSocket.readyState === 1) {
      wasReady = true;
      // 🔥 FLOW client pings simulator
      theSocket.send(
        JSON.stringify({ command: '__ping__' } satisfies Message)
      );
      // 👇 lintelIsReady to rock!
      resolve(true);
    } else if (wasReady) {
      clearInterval(intervalID);
      alert('The simulator is down; restart it then hit OK');
      location.reload();
    }
  }, keepAliveMillis);

  // 👇 listen for messages to the webview from the simulated extension
  theSocket.addEventListener('message', ({ data }) => {
    const message: Message = JSON.parse(data);
    // 🔥 FLOW client receives message from simulator
    if (message.command === '__reload__') location.reload();
    else if (message.command !== '__pong__') {
      console.log(`🗨️ ${message}`);
      const event = new CustomEvent('message', { detail: message });
      dispatchEvent(event);
    }
  });

  // 👇 smoke test to check if all setup
  lintelIsReady.then(() => {
    lintelWebviewAPI.setState({ smokeTest: { x: 1, y: 2 } });
    const { x, y } = lintelWebviewAPI.getState().smokeTest;
    if (x === 1 && y === 2) {
      lintelWebviewAPI.postMessage({
        command: '__smoke_test__'
      } satisfies Message);
      console.log(
        '%c🖨️ webview simulator is ready',
        'color: lightgreen'
      );
    }
  });

  return;
}
