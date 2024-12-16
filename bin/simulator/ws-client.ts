// 🔥 this must be self-contained, so we can't import any TypeScript code

type Params = {
  httpPort: number;
  wsPort: number;
};

// 📘 injected into webview's index.html to control websocket
//    conversations to and from ws-server.ts

declare let acquireVsCodeApi;

export async function wsClient({ httpPort, wsPort }: Params): Promise<any> {
  let socket: WebSocket = null;

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
      postMessage: (data) => {
        console.log({ data }); // 🔥 TEMP
        socket?.send(data);
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
      socket.send('ready');
    }
  }, 5);

  // 👇 listen for messages to the webview from the simulated extension
  socket.addEventListener('message', (message: MessageEvent) => {
    console.log(JSON.stringify(message)); // 🔥 TEMP
    if (message.data === 'reload') location.reload();
    else globalThis.dispatchEvent(message.data);
  });

  // 👇 simulate the VSCode appDistPath

  return;
}
