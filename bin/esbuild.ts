import { build } from 'esbuild';
import { log } from './logger.ts';
import { parseArgs } from '@std/cli/parse-args';

import process from 'node:process';

// 📘 run esbuild
//    ./bin/esbuild.ts
//    --root=./dist/webview/webview/index.js
//    --bundle=./dist/webview/webview/bundle.js
//    --tsconfig=./tsconfig-app.json

const { root, bundle, tsconfig } = parseArgs(Deno.args);

// 👇 run the biz

build({
  bundle: true,
  entryPoints: [`${root}`],
  minify: true,
  outfile: `${bundle}`,
  sourcemap: true,
  tsconfig: `${tsconfig}`
}).catch((e) => {
  log({ data: e, error: true });
  process.exit(1);
});
