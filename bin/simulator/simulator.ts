import { config } from '../config.ts';
import { extension } from './extension.ts';
import { server } from './server.ts';

import openBrowser from 'open';
import process from 'node:process';

type Params = {
  dir: string;
  open?: boolean;
};

type ThreadLocal = {
  watcher$: Deno.FsWatcher;
};

const threadLocals: Record<number, ThreadLocal> = {};

// 📘 serve a simulator for a VSCode webview extension

export function simulator({ dir, open }: Params): Promise<void> {
  // 👇 keep track of active watchers
  const watcher$ = Deno.watchFs(dir);
  threadLocals[process.pid] = { watcher$ };

  // 👇 get the HTTP server ready
  server({ dir });

  // 👇 if requested, open the browser
  if (open) openBrowser(`http://localhost:${config.simulator.http.port}`);

  // 👇 run the extension
  return extension({ watcher$ });
}

// 👇 so that the simuylator can be killed

export function kill(): Promise<void> {
  const threadLocal = threadLocals[process.pid];
  if (threadLocal) {
    threadLocal.watcher$.close();
    threadLocal[process.pid] = null;
  }
  return Promise.resolve();
}
