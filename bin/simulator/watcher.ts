import { config } from '../config.ts';
import { debounce } from 'jsr:@std/async/debounce';

import $ from '@david/dax';

type Params = {
  dir: string;
  cb: () => void;
};

// 📘 watches for changes in the webview code

export async function watcher({ dir, cb }: Params): Promise<void> {
  const watcher = Deno.watchFs(dir);
  const pb = $.progress('watching for changes');
  // 👇 create a debounced function that's invoked on changes
  const debounced = debounce((_) => {
    pb.finish();
    // 👇 webview has changed
    cb();
  }, config.debounceMillis);
  // 👇 then run it on each change
  for await (const event of watcher) debounced(event);
}
