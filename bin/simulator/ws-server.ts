// 📘 provides WebSocket services for the simulator

import { config } from '@lib/config.ts';

export function wsServer(
  controller: AbortController,
  cb: (socket: WebSocket) => void
): void {
  Deno.serve({ port: config.simulator.ws.port }, (req) => {
    if (req.headers.get('upgrade') === 'websocket') {
      const { response, socket } = Deno.upgradeWebSocket(req);
      // 👇 listen for open
      socket.addEventListener('open', webSocketOpened, {
        signal: controller.signal
      });
      // 👇 listen for message
      socket.addEventListener('message', webSocketMessage, {
        signal: controller.signal
      });
      // 👇 listen for close
      socket.addEventListener('close', webSocketClosed, {
        signal: controller.signal
      });
      // 👇 got a new socket
      cb(socket);
      return response;
    } else {
      // 🔥 just let it go until we get a good request
      return new Response(null, { status: 200 });
    }
  });
}

function webSocketOpened(): void {
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %cconnected`,
    `color: ${config.log.color.ts}`,
    `color: ${config.log.color.text}`
  );
}

function webSocketMessage({ data }): void {
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %creceived: %c${data}`,
    `color: ${config.log.color.ts}`,
    `color: ${config.log.color.text}`,
    `color: ${config.log.color.data}`
  );
  // 🔥 do something with message
}

function webSocketClosed(): void {
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %cdisconnected`,
    `color: ${config.log.color.ts}`,
    `color: ${config.log.color.text}`
  );
}
