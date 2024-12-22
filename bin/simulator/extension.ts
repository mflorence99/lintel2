import { config } from '../config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { log } from '../logger.ts';

type Params = {
  ac: AbortController;
  dir: string;
  watcher$: Deno.FsWatcher;
};

// 📘 implements the extension via a socket connection to the webview

let theSocket: WebSocket = null;

export function extension({ ac, dir, watcher$ }: Params): Promise<void> {
  log({ important: 'waiting for webview...' });
  Deno.serve(opts(), (req) => {
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
      log({ text: 'webview has connected' });
      return response;
    } else {
      // 🔥 just let it go until we get a good request
      return new Response(null, { status: 200 });
    }
  });

  // 👇 start watching for file changes
  return watcher(dir, watcher$, () => {
    log({ text: 'extension sends reload to webview' });
    // 🔥 FLOW simulator sends reload to webview on file change
    theSocket?.send(JSON.stringify({ command: '__reload__' }));
  });

  // 🔥 TEMPORARy

  function _postMessage(message): void {
    theSocket?.send(JSON.stringify(message));
  }

  // 👇 make server options

  function opts(): any {
    return {
      onListen({ port, hostname }) {
        log({
          important: `WebSocket server started`,
          text: `ws://${hostname}:${port}`
        });
      },
      port: config.simulator.ws.port,
      signal: ac?.signal
    };
  }

  // 👇 watch for file changes

  async function watcher(dir, watcher$, cb): Promise<void> {
    log({ important: 'watching for changes', text: dir });
    // 👇 create a debounced function that's invoked on changes
    const debounced = debounce((_) => {
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
