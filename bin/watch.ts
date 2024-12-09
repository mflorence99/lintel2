#!/usr/bin/env -S deno run --allow-all
import { debounce } from 'jsr:@std/async/debounce';
import { parseArgs } from '@std/cli/parse-args';

import $ from '@david/dax';

const flags = parseArgs(Deno.args);

const watcher = Deno.watchFs(flags.dir);

const commander = async () => {
  const now = new Date();
  console.log(
    `%c${now.toLocaleTimeString()} %c${flags.cmd}`,
    'color: green',
    'color: yellow'
  );
  try {
    const result = await $.raw`${flags.cmd}`.stderr('piped').stdout('piped');
    if (result.stderr) console.error(`%c${result.stderr}`, 'color: red');
  } catch (e: any) {
    console.error(`%c${e}`, 'color: red');
  }
};

await commander();

const handler = debounce(async (_) => {
  await commander();
}, 250);

for await (const event of watcher) {
  handler(event);
}
