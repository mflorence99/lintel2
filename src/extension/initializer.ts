import { ExtensionAPI } from '~extension/types/api';
import { Linter } from 'eslint';

import { build } from 'esbuild';
import { findUp } from 'find-up';
import { resolveFromRoot } from '~extension/resolve';

import jsome from 'jsome';

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
  console.time('esbuild');
  api.log({ text: `Compiling ${configFileName}...` });
  const compiled = await build({
    bundle: true,
    entryPoints: [configFileName],
    // 🔥 TEMPORARY
    external: ['./worker', 'eslint/lib/util/glob-util'],
    platform: 'node',
    write: false
  });
  console.timeEnd('esbuild');

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
  console.time('import config');
  const blob = new Blob([javascript], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  await import(url); // 👈 see globalThis.__module__.exports.default
  URL.revokeObjectURL(url); // 👈 GC ObjectURLs
  console.timeEnd('import config');

  // 👇 load eslint itself from same directory as config file
  const eslint = await resolveFromRoot('eslint', api.cwd());

  // 👇 pretreat the default configs
  const defaultConfigs = eslint.ESLint.defaultConfig.map(
    (config: Linter.Config) => ({
      ...config,
      name: 'eslint/defaults'
    })
  );

  // 👇 we now have an array of configs
  const allConfigs: Linter.Config[] = [
    ...defaultConfigs,
    // 👉 maybe an arrary, maybe not
    ...[globalThis.__module__.exports.default].flat()
  ];

  // 👇 load eslint rules from same directory as config file
  // 🔥 see https://github.com/eslint/eslint/blob/df409d8f76555c7baa4353d678d5fc460454a4d7/docs/src/use/migrate-to-8.0.0.md
  const eslintUnsupported = await resolveFromRoot(
    'eslint/use-at-your-own-risk',
    api.cwd()
  );
  const eslintRules = eslintUnsupported.default.builtinRules;

  // 🔥 TEMPORARY smoke test
  for (const [name, rule] of eslintRules.entries()) {
    // jsome({ name, rule });
    break;
  }

  allConfigs.forEach(
    ({ name, files, ignores, rules, plugins }, index) =>
      console.log({
        index,
        name,
        files,
        ignores,
        settings: rules ? Object.keys(rules).length : 0,
        plugins: plugins ? Object.keys(plugins) : [],
        rules: plugins
          ? Object.values(plugins).map(
              (plugin) => Object.keys(plugin.rules ?? {}).length
            )
          : []
      })
  );

  // const cfg = new eslint.ESLint({
  //   cwd: api.cwd()
  // }).calculateConfigForFile(
  //   '/home/markf/mflorence99/lintel2/src/webview/components/app-root.tsx'
  // );

  // jsome(cfg);

  // jsome(allConfigs[9]);
}
