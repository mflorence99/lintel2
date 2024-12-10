import { httpServer } from './http-server.ts';
import { parseArgs } from '@std/cli/parse-args';
import { webviewWatcher } from './webview-watcher.ts';
import { wsServer } from './ws-server.ts';

import $ from '@david/dax';

// 📘 serve a simulator for a VSCode webview extension
//    deno run -A ./bin/simulator/main.ts
//    --dir=./dist/webview
//    --no-open

const { dir, open } = parseArgs(Deno.args);

// 👇 get the HTTP server ready

httpServer(dir, !!open);

// 👇 get the WebSocket server ready ie when a client connects

let socket: WebSocket;
const pb = $.progress('Waiting for client to connect...');
const controller = new AbortController();
wsServer(controller, (_socket) => {
  if (socket) {
    controller.abort();
    socket.close();
  }
  socket = _socket;
  pb.finish();
});

// 👇 now we can start watching for file changes

webviewWatcher(dir, () => socket.send('reload'));
