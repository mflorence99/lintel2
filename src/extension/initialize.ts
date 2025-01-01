import { ExtensionAPI } from './api';
import { ExtensionEnv } from './env';

import { build } from 'esbuild';
import { findUp } from 'find-up';
import { join } from 'node:path';
import { writeFile } from 'node:fs/promises';

// 📘 initialize the extension with a new ESLint config

export async function initialize(
  api: ExtensionAPI,
  env: ExtensionEnv
): Promise<void> {
  api.log({ text: `initializing`, data: env });

  // 👇 all possible config file names
  const configFileNames = [
    'eslint.config.js',
    'eslint.config.mjs',
    'eslint.config.cjs',
    'eslint.config.ts',
    'eslint.config.mts',
    'eslint.config.cts'
  ];

  // 👇 find the right config file
  const configFileName = await findUp(configFileNames, env);
  if (!configFileName) throw new Error('No ESLint config file found');

  // 👇 compile it into one ginormous bundle
  api.log({ text: `Compiling ${configFileName}...` });
  const compiled = await build({
    absWorkingDir: env.cwd,
    bundle: true,
    entryPoints: [configFileName],
    // 🔥 TEMPORARY
    external: ['./worker', 'eslint/lib/util/glob-util'],
    outfile: 'out.js',
    platform: 'node',
    write: false
  });

  // 👇 munge compiled config file
  if (!compiled.outputFiles)
    throw new Error(`${configFileName} could not be compiled`);
  let { text } = compiled.outputFiles[0];
  text = text.replaceAll(
    /import_meta([0-9]?) = \{\}/g,
    `import_meta$1 = {url: 'file://' + __filename}`
  );

  // 👇 write to temporary file
  const compiledFileName = join(
    /* env.tmpDir */ env.cwd,
    'dist',
    'config.cjs'
  );
  await writeFile(compiledFileName, text);
  api.log({ text: `... Compiled to ${compiledFileName}` });

  // 👇 import the compiled file
  const module = await import(compiledFileName);
  console.debug(module);
}
