import { httpServer } from './http-server.ts';
import { log } from '../logger.ts';
import { webviewWatcher } from './webview-watcher.ts';
import { wsServer } from './ws-server.ts';

import $ from '@david/dax';

type Params = {
  dir: string;
  open?: boolean;
};

// 📘 serve a simulator for a VSCode webview extension

export function simulator({ dir, open }: Params): Promise<void> {
  // 👇 get the HTTP server ready
  httpServer({ dir, open });

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

  // 👇 allows us to await
  return Promise.resolve();
}
