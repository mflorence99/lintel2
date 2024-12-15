import { analyzeMetafile } from 'esbuild';
import { build } from 'esbuild';
import { log } from './logger.ts';

import process from 'node:process';

type Params = {
  bundle: string;
  prod: boolean;
  verbose: boolean;
  root: string;
  tsconfig: string;
};

// 📘 run esbuild

export async function esbuild({
  bundle,
  prod,
  verbose,
  root,
  tsconfig
}: Params): Promise<any> {
  // 👇 perform the build
  const result = await build({
    bundle: true,
    entryPoints: [`${root}`],
    logLevel: verbose ? 'info' : 'warning',
    metafile: verbose,
    minify: prod,
    outfile: `${bundle}`,
    sourcemap: true,
    tsconfig: `${tsconfig}`
  }).catch((e: any) => {
    log({ error: true, data: e.message });
    process.exit(1);
  });

  // 👇 analyze bundle
  if (verbose) {
    const analysis = await analyzeMetafile(result.metafile);
    console.log(analysis);
  }

  // 👇 we're done!
  return result;
}
