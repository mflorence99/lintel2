// 📘 injected into webview's index.html to control websocket
//    conversations to and from ws-server.ts

// 🔥 this must be self-contained, so we can't import any TypeScript code

export async function wsClient(
  httpPort: number,
  wsPort: number
): Promise<void> {
  // 👇 initialize the WebSocket protocol
  await fetch(`http://localhost:${httpPort}`, {
    headers: { upgrade: 'websocket' },
    mode: 'no-cors'
  });
  // 👇 now we can try to connect to the socket
  const socket = new WebSocket(`ws://localhost:${wsPort}`);
  const intervalID = setInterval(() => {
    if (socket.readyState === 1) {
      clearInterval(intervalID);
      socket.send('ready');
    }
  }, 5);
  // 👇 start listening for messages
  socket.addEventListener('message', (event) => {
    console.log({ event });
    if (event.data === 'reload') location.reload();
  });
}
