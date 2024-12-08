#!/usr/bin/env -S deno run --allow-all
import { debounce } from 'jsr:@std/async/debounce';
import { parseArgs } from '@std/cli/parse-args';

import $ from '@david/dax';

const flags = parseArgs(Deno.args);

const watcher = Deno.watchFs(flags.dir);

await $.raw`${flags.cmd}`;

const handler = debounce(async (_) => {
  const now = new Date();
  console.log(now.toLocaleTimeString());
  await $.raw`${flags.cmd}`;
}, 250);

for await (const event of watcher) {
  handler(event);
}
