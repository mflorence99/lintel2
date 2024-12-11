#!/usr/bin/env -S deno run --allow-all

import { config } from '@lib/config.ts';
import { debounce } from 'jsr:@std/async/debounce';
import { parseArgs } from '@std/cli/parse-args';
import { log } from './logger.ts';

import $ from '@david/dax';

// 📘 watch files in a directory and run a command on changes
//    ./bin/watch.ts
//    --dir=./src/webview
//    --cmd=npm run compile:webview

const { cmd, dir } = parseArgs(Deno.args);

// 👇 run the command first time

await run();

// 👇 now set it up to run whenever files change

const watcher = Deno.watchFs(dir);
const debounced = debounce(
  async (event: Deno.FsEvent) => await run(event.paths),
  config.debounceMillis
);
for await (const event of watcher) debounced(event);

// 👇 run the command when paths have changed

async function run(paths: string[] = []) {
  // 👇 extract shortest changed path
  const files = paths.map((path) => {
    const ix = path.indexOf(dir) + dir.length + 1;
    return path.substring(ix);
  });
  // 👇 log the command in detail
  log({ data: files, important: cmd, text: 'changed:' });
  try {
    // 👇 silently run the command
    const result = await $.raw`${cmd}`.stderr('piped').stdout('piped');
    if (result.stderr) throw new Error(result.stderr);
  } catch (e: any) {
    // 🔥 ooops!
    log({ data: e, error: true });
  }
}
