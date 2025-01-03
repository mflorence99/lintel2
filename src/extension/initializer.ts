import { ESLint } from 'eslint';
import { ExtensionAPI } from '~extension/types/api';

import { build } from 'esbuild';
import { findUp } from 'find-up';

declare const globalThis: any;

// 📘 initialize the extension with a new ESLint config

export async function initialize(api: ExtensionAPI): Promise<void> {
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
  const configFileName = await findUp(configFileNames, {
    cwd: api.cwd()
  });
  if (!configFileName) throw new Error('No ESLint config file found');

  // 👇 compile it into one ginormous bundle
  api.log({ text: `Compiling ${configFileName}...` });
  const compiled = await build({
    bundle: true,
    entryPoints: [configFileName],
    // 🔥 TEMPORARY
    external: ['./worker', 'eslint/lib/util/glob-util'],
    format: 'cjs',
    platform: 'node',
    write: false
  });

  // 👇 did the compile work?
  if (!compiled.outputFiles)
    throw new Error(`${configFileName} could not be compiled`);
  else api.log({ text: `${configFileName} successfully compiled` });
  let { text: javascript } = compiled.outputFiles[0];

  // 👇 prepare the javascript for dynamic loading
  globalThis.__dirname__ = __dirname;
  globalThis.__filename__ = __filename;
  globalThis.__global__ = global;
  globalThis.__module__ = { ...module };
  globalThis.__require__ = require;
  javascript = `
  var __dirname = globalThis.__dirname__;
  var __filename = globalThis.__filename__;
  var global = globalThis.__global__;
  var module = globalThis.__module__;
  var require = globalThis.__require__;
  ${javascript.replaceAll(
    /import_meta([0-9]?) = \{\}/g,
    `import_meta$1 = {url: 'file://' + __filename}`
  )}
  `;

  // 👇 import the compiled config file
  const blob = new Blob([javascript], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  await import(url); // 👈 see globalThis.__module__.exports.default
  URL.revokeObjectURL(url); // 👈 GC ObjectURLs

  // 👇 we now have an array of configs
  const configs = [
    ...ESLint.defaultConfig,
    // 👉 maybe an arrary, maybe not
    ...[globalThis.__module__.exports.default].flat()
  ];

  // 🔥 TEMPORARY smoke test
  console.log(configs.map((c) => c.rules));
}
