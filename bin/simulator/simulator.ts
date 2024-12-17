import { config } from '../config.ts';
import { extension } from './extension.ts';
import { server } from './server.ts';

import openBrowser from 'open';

type Params = {
  dir: string;
  open?: boolean;
};

// 📘 serve a simulator for a VSCode webview extension

export async function simulator({ dir, open }: Params): Promise<void> {
  // 👇 get the HTTP server ready
  server({ dir });

  // 👇 if requested, open the browser
  if (open) openBrowser(`http://localhost:${config.simulator.http.port}`);

  // 👇 run the extension
  await extension({ dir });
}
