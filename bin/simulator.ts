import { config } from '~bin/config';
import { delay } from '@std/async/delay';
import { extension } from '~simulator/extension';
import { http } from '~simulator/server';
import { log } from '~bin/logger';

import process from 'node:process';

// 📘 serve a simulator for a VSCode webview extension
//    designed to be called inside of exec.ts, hence the primitive
//    args parsing - just pass the directrory to simulate

const simdir = Deno.args[0] || process.cwd();

// 👇 this is the code we are running in the simulation
const webdir = config.paths['webview-js'];
const watchdirs = [`${webdir}/index.js`];

// 👇 this allows us to cancel server
const ac = new AbortController();

// 👇 keep track of active watchers
const watcher$ = Deno.watchFs(watchdirs);

// 👇 get the HTTP server ready
const server = http({ ac, dir: webdir });

// 👇 clean up when aborted
Deno.addSignalListener('SIGINT', async () => {
  log({ important: 'SIGINT', text: 'simulator shutting down' });
  // 👇 close the watcher
  watcher$.close();
  // 👇 close the server and wait for it to complete
  ac.abort();
  await server.finished;
  // 👇 give the client time to realize the server is down
  await delay(config.keepAliveMillis * 2);
  Deno.exit(0);
});

// 👇 run the extension
await extension({ ac, simdir });
