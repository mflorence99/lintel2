import { config } from '../config.ts';
import { log } from '../logger.ts';

type Params = {
  cb: (socket: WebSocket) => void;
};

// 📘 provides WebSocket services for the simulator

export function wsServer({ cb }: Params): void {
  let oldSocket;
  Deno.serve({ port: config.simulator.ws.port }, (req) => {
    if (req.headers.get('upgrade') === 'websocket') {
      const { response, socket } = Deno.upgradeWebSocket(req);
      // 👇 got a new socket, free the old one
      if (oldSocket) {
        oldSocket.removeEventListener('open', webSocketOpened);
        oldSocket.removeEventListener('message', webSocketMessage);
        oldSocket.removeEventListener('close', webSocketClosed);
        oldSocket.close();
      }
      // 👇 listen for events
      socket.addEventListener('open', webSocketOpened);
      socket.addEventListener('message', webSocketMessage);
      socket.addEventListener('close', webSocketClosed);
      // 👇 got a new socket
      cb(socket);
      oldSocket = socket;
      return response;
    } else {
      // 🔥 just let it go until we get a good request
      return new Response(null, { status: 200 });
    }
  });
}

function webSocketOpened(): void {
  log({ text: 'connected' });
}

function webSocketMessage(message: MessageEvent): void {
  log({ data: message, text: 'received' });
  // 🔥 do something with message
}

function webSocketClosed(): void {
  log({ text: 'disconnected' });
}
