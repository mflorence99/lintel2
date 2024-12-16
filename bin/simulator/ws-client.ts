// 🔥 this must be self-contained, so we can't import any TypeScript code

type Params = {
  httpPort: number;
  wsPort: number;
};

// 📘 injected into webview's index.html to control websocket
//    conversations to and from ws-server.ts

declare let acquireVsCodeApi: any;

declare let lintelIsReady: Promise<unknown>;

export async function wsClient({ httpPort, wsPort }: Params): Promise<any> {
  let socket: WebSocket = null;

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
        console.log(message); // 🔥 TEMP
        // 🔥 FLOW client sends message to simulator
        socket?.send(JSON.stringify(message));
      }
    };
  };

  // 👇 initialize the WebSocket protocol
  await fetch(`http://localhost:${httpPort}`, {
    headers: { upgrade: 'websocket' },
    mode: 'no-cors'
  });

  // 👇 now we can try to connect to the socket
  socket = new WebSocket(`ws://localhost:${wsPort}`);
  const intervalID = setInterval(() => {
    if (socket.readyState === 1) {
      clearInterval(intervalID);
      console.log('%cready', 'color: yellow'); // 🔥 TEMP
      // 🔥 FLOW client sends ready to simulator
      socket.send(JSON.stringify({ command: 'ready' }));
      // 👇 Lintel is ready to rock!
      resolve(true);
    }
  }, 5);

  // 👇 listen for messages to the webview from the simulated extension
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    console.log(message); // 🔥 TEMP
    // 🔥 FLOW client receives message from simulator
    if (message.command === 'reload') location.reload();
    else globalThis.dispatchEvent(message);
  });

  return;
}
