import { httpServer } from './http-server.ts';
import { log } from '../logger.ts';
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

httpServer({ dir, open: !!open });

// 👇 get the WebSocket server ready ie when a client connects

let socket: WebSocket;
// 👉 this only shows for the first socket connection
//    not on any reload
const pb = $.progress('Waiting for client...');
wsServer({
  cb: (newSocket) => {
    log({ important: 'Client has connected...' });
    socket = newSocket;
    pb.finish();
  }
});

// 👇 now we can start watching for file changes

webviewWatcher({ dir, cb: () => socket?.send('reload') });
