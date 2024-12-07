#!/usr/bin/env -S deno run --allow-all
import { debounce } from 'jsr:@std/async/debounce';
import { parseArgs } from '@std/cli/parse-args';

import $ from '@david/dax'; // "dax-sh" in Node

const flags = parseArgs(Deno.args);

const watcher = Deno.watchFs(flags.dir);

const command = $`npm run ${flags.script}`.quiet().printCommand();

await command;

const handler = debounce(async (_) => {
  await command;
}, 2000);

for await (const event of watcher) {
  handler(event);
}
