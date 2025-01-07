import { analyzeMetafile } from 'esbuild';
import { build } from 'esbuild';
import { log } from '~bin/logger';

type Params = {
  bundle: string;
  platform?: 'node' | 'browser';
  prod: boolean;
  tedious: boolean;
  verbose: boolean;
  root: string;
  tsconfig?: string;
};

// 📘 run esbuild

export async function esbuild({
  bundle,
  platform,
  prod,
  tedious,
  verbose,
  root,
  tsconfig
}: Params): Promise<any> {
  // 👇 perform the build
  const result = await build({
    bundle: true,
    entryPoints: [`${root}`],
    external: ['esbuild'],
    loader: { '.ttf': 'binary', '.woff': 'binary', '.woff2': 'binary' },
    logLevel: verbose ? 'info' : 'warning',
    metafile: verbose,
    minify: prod,
    outfile: bundle,
    platform,
    sourcemap: prod ? true : 'inline',
    tsconfig
  }).catch((e: any) => {
    log({ error: true, data: e.message });
  });

  // 👇 analyze bundle
  // @ts-ignore 🔥 no metafile in type definition?
  const metafile = result?.metafile;
  if (tedious && metafile) {
    const analysis = await analyzeMetafile(metafile);
    console.log(analysis);
  }

  // 👇 we're done!
  return result;
}
