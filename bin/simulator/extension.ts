import { config } from '~bin/config';
import { debounce } from 'jsr:@std/async/debounce';
import { log } from '~bin/logger';

import process from 'node:process';

declare const globalThis: any;

// 🔥 steal some types from the real code
import type { ExtensionAPI } from '~extension/types/api';
import type { ExtensionRuntime } from '~lib/types/runtime';
import type { Message } from '~lib/types/messages';

type Params = {
  ac: AbortController;
  dirs: string[];
  watcher$: Deno.FsWatcher;
};

// 📘 implements the extension via a socket connection to the webview

export async function extension({
  ac,
  dirs,
  watcher$
}: Params): Promise<void> {
  let theSocket: WebSocket = null;

  // 👇 load the extension code
  globalThis.lintelExtensionRuntime =
    'simulated' satisfies ExtensionRuntime;
  globalThis.lintelExtensionAPI = {
    cwd: process.cwd,
    log,
    onDidReceiveMessage: null, // 👈 completed later by extension
    postMessage: (message: Message) => {
      theSocket?.send(JSON.stringify(message));
    }
  } satisfies ExtensionAPI;
  await import('../../dist/extension/index.cjs');

  // 👇 just a shortcut
  const api: ExtensionAPI = globalThis.lintelExtensionAPI;

  // 👇 start the websocket
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
      log({ text: 'webview connected' });
      // 👇 re-initialize the extension
      api.onDidReceiveMessage?.({
        command: 'initialize'
      } satisfies Message);
      return response;
    } else {
      // 🔥 just let it go until we get a good request
      return new Response(null, { status: 200 });
    }
  });

  // 👇 start watching for file changes
  return watcher(dirs, watcher$, () => {
    log({ text: 'extension sends reload to webview' });
    // 🔥 FLOW simulator sends reload to webview on file change
    theSocket?.send(
      JSON.stringify({ command: '__reload__' } satisfies Message)
    );
  });

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

  async function watcher(dirs, watcher$, cb): Promise<void> {
    log({ important: 'watching for changes', data: dirs });
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
    const message: Message = JSON.parse(data);
    if (message.command === '__ping__')
      theSocket.send(
        JSON.stringify({ command: '__pong__' } satisfies Message)
      );
    else {
      // 🔥 FLOW simulator receives message fronm webview
      api.onDidReceiveMessage?.(message);
    }
  }

  function webSocketClosed(): void {
    log({ text: 'socket disconnected' });
  }
}
