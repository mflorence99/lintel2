import myConfig from 'eslint-config-mflorence99';

export default [
  ...myConfig,
  {
    languageOptions: {
      parserOptions: {
        project: ['src/extension/tsconfig.json', 'src/webview/tsconfig.json']
      }
    }
  },
  { ignores: ['./eslint.config.mjs', './bin/**/*.ts'] }
];
