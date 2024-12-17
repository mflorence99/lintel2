import { config } from '../config.ts';
import { log } from '../logger.ts';
import { watcher } from './watcher.ts';

import $ from '@david/dax';

type Params = {
  dir: string;
};

// 📘 implements the extension via a socket connection to the webview

let theSocket: WebSocket = null;

export async function extension({ dir }: Params): Promise<void> {
  const pb = $.progress('waiting for webview');
  Deno.serve({ port: config.simulator.ws.port }, (req) => {
    if (req.headers.get('upgrade') === 'websocket') {
      const { response, socket } = Deno.upgradeWebSocket(req);
      // 👇 got a new socket, free the old one
      if (theSocket) {
        theSocket.removeEventListener('open', webSocketOpened);
        theSocket.removeEventListener('message', webSocketMessage);
        theSocket.removeEventListener('close', webSocketClosed);
        theSocket.close();
      }
      // 👇 listen for events
      theSocket = socket;
      theSocket.addEventListener('open', webSocketOpened);
      theSocket.addEventListener('message', webSocketMessage);
      theSocket.addEventListener('close', webSocketClosed);
      // 👇 got a new socket
      pb.finish();
      log({ text: 'webview has connected' });
      return response;
    } else {
      // 🔥 just let it go until we get a good request
      return new Response(null, { status: 200 });
    }
  });

  // 👇 start watching for file changes
  await watcher({
    dir,
    cb: () => {
      log({ text: 'extension sends reload to webview' });
      // 🔥 FLOW simulator sends reload to webview on file change
      theSocket?.send(JSON.stringify({ command: '__reload__' }));
    }
  });
}

export function postMessage(message): void {
  theSocket?.send(JSON.stringify(message));
}

function webSocketOpened(): void {
  log({ text: 'socket connected' });
}

function webSocketMessage({ data }): void {
  const message = JSON.parse(data);
  if (message.command === '__ping__')
    theSocket.send(JSON.stringify({ command: '__pong__' }));
  else {
    log({ text: 'received', data: message });
    // 🔥 FLOW simulator receives message fronm webview
    //    dispatch on command here
  }
}

function webSocketClosed(): void {
  log({ text: 'socket disconnected' });
}
