import { config } from '../config.ts';
import { httpServer } from './http-server.ts';
import { log } from '../logger.ts';
import { webviewWatcher } from './webview-watcher.ts';
import { wsServer } from './ws-server.ts';

import $ from '@david/dax';
import openBrowser from 'open';

type Params = {
  dir: string;
  open?: boolean;
};

// 📘 serve a simulator for a VSCode webview extension

export async function simulator({ dir, open }: Params): Promise<void> {
  // 👇 get the HTTP server ready
  httpServer({ dir });

  // 👇 if requested, open the browser
  if (open) openBrowser(`http://localhost:${config.simulator.http.port}`);

  // 👇 get the WebSocket server ready ie when a client connects
  let socket: WebSocket;
  // 👉 this only shows for the first socket connection
  //    not on any reload
  const pb = $.progress('waiting for client');
  wsServer({
    cb: (newSocket) => {
      pb.finish();
      log({ important: 'client has connected' });
      socket = newSocket;
    }
  });

  // 👇 now we can start watching for file changes
  await webviewWatcher({
    dir,
    cb: () => {
      log({ important: 'simulator is ready with new socket' });
      // 🔥 FLOW simulator sends reload to client on file change
      socket?.send(JSON.stringify({ command: 'reload' }));
    }
  });
}
