import { config } from '../config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { log } from '../logger.ts';

import $ from '@david/dax';

type Params = {
  watcher$: Deno.FsWatcher;
};

// 📘 implements the extension via a socket connection to the webview

let theSocket: WebSocket = null;

export function extension({ watcher$ }: Params): Promise<void> {
  const pb = $.progress('waiting for webview');
  Deno.serve(
    {
      onListen({ port, hostname }) {
        log({
          important: `WebSocket server started`,
          text: `ws://${hostname}:${port}`
        });
      },
      port: config.simulator.ws.port
    },
    (req) => {
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
    }
  );

  // 👇 start watching for file changes
  return watcher(watcher$, () => {
    log({ text: 'extension sends reload to webview' });
    // 🔥 FLOW simulator sends reload to webview on file change
    theSocket?.send(JSON.stringify({ command: '__reload__' }));
  });

  // 🔥 TEMPORAR

  function _postMessage(message): void {
    theSocket?.send(JSON.stringify(message));
  }

  // 👇 watch for file changes

  async function watcher(watcher$, cb): Promise<void> {
    const pb = $.progress('watching for changes');
    // 👇 create a debounced function that's invoked on changes
    const debounced = debounce((_) => {
      pb.finish();
      // 👇 webview has changed
      cb();
    }, config.debounceMillis);
    // 👇 then run it on each change
    for await (const event of watcher$) debounced(event);
  }
  // 👇 event handlers

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
      //    dispatch on command here passing postMessage
    }
  }

  function webSocketClosed(): void {
    log({ text: 'socket disconnected' });
  }
}
