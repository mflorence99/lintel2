import { config } from '@lib/config.ts';
import { debounce } from 'jsr:@std/async/debounce';

// 📘 watches for changes in the webview code

export async function webviewWatcher(
  dir: string,
  cb: () => void
): Promise<void> {
  const watcher = Deno.watchFs(`${Deno.cwd()}/${dir}`);
  const debounced = debounce(
    (event: Deno.FsEvent) => changed(dir, event.paths, cb),
    config.debounceMillis
  );
  for await (const event of watcher) {
    debounced(event);
  }
}

// 👇 webview has changed

function changed(dir: string, paths: string[], cb: () => void) {
  const files = paths.map((path) => {
    const ix = path.indexOf(dir) + dir.length + 1;
    return path.substring(ix);
  });
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %creloading:%c[${files.join(',')}]`,
    `color: ${config.log.color.ts}`,
    `color: ${config.log.color.text}`,
    `color: ${config.log.color.data}`
  );
  // 👇 webview has changed
  cb();
}
