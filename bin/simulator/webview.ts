// 🔥 this must be self-contained, so we can't import any TypeScript code

type Params = {
  httpPort: number;
  pingPongMillis: number;
  wsPort: number;
};

// 📘 injected into index.html to provide a base simulation
//     of VSCode's webview support via a socket connection to
//     the extension

declare let acquireVsCodeApi: any;

declare let lintelIsReady: Promise<unknown>;

export async function webview({
  httpPort,
  pingPongMillis,
  wsPort
}: Params): Promise<any> {
  let theSocket: WebSocket = null;

  // 👇 lintelIsReady is resolved when the socket connection is open

  const { promise, resolve } = Promise.withResolvers();
  lintelIsReady = promise;

  // 👇 put the simulated VSCode API on the global namespace

  acquireVsCodeApi = () => {
    return {
      // 👇 retrieve webview state
      getState: () => {
        const state = {};
        let ix = 0;
        let key;
        while ((key = localStorage.key(ix++)))
          state[key] = localStorage.getItem(key);
        return state;
      },

      // 👇 set webview state
      setState: (state) => {
        Object.keys(state).forEach((key) =>
          localStorage.setItem(key, state[key])
        );
      },

      // 👇 post message to the simulated extension from the webview
      postMessage: (message) => {
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
      theSocket.send(JSON.stringify({ command: '__ping__' }));
      // 👇 Lintel is ready to rock!
      resolve(true);
    } else if (wasReady) {
      clearInterval(intervalID);
      alert('The simulator is down; restart it then hit OK');
      location.reload();
    }
  }, pingPongMillis);

  // 👇 listen for messages to the webview from the simulated extension
  theSocket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    // 🔥 FLOW client receives message from simulator
    if (message.command === '__reload__') location.reload();
    else if (message.command !== '__pong__') {
      console.log(message);
      const event = new CustomEvent('message', { detail: message });
      dispatchEvent(event);
    }
  });

  return;
}
