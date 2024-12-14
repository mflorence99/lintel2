import { config } from '../config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { log } from '../logger.ts';

type Params = {
  dir: string;
  cb: () => void;
};

// 📘 watches for changes in the webview code

export async function webviewWatcher({ dir, cb }: Params): Promise<void> {
  const watcher = Deno.watchFs(dir);
  const debounced = debounce(
    (event: Deno.FsEvent) => changed({ dir, paths: event.paths, cb }),
    config.debounceMillis
  );
  for await (const event of watcher) {
    debounced(event);
  }
}

// 👇 webview has changed

function changed({ dir, paths, cb }) {
  const files = paths.map((path) => {
    const ix = path.indexOf(dir) + dir.length + 1;
    return path.substring(ix);
  });
  log({ data: files, text: 'reloading:' });
  // 👇 webview has changed
  cb();
}
