import { config } from '../config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { log } from '../logger.ts';

import $ from '@david/dax';

type Params = {
  dir: string;
  cb: () => void;
};

// 📘 watches for changes in the webview code

export async function webviewWatcher({ dir, cb }: Params): Promise<void> {
  const watcher = Deno.watchFs(dir);
  const pb = $.progress('watching for changes');
  // 👇 create a debounced function that's invoked on changes
  const debounced = debounce((_) => {
    pb.finish();
    log({ important: 'sending "reload" to client' });
    // 👇 webview has changed
    cb();
  }, config.debounceMillis);
  // 👇 then run it on each change
  for await (const event of watcher) debounced(event);
}
