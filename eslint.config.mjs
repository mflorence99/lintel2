import myConfig from 'eslint-config-mflorence99';

export default [
  ...myConfig,
  {
    ignores: ['**/*.js', '**/*.mjs', '**/bin/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['src/extension/tsconfig.json', 'src/webview/tsconfig.json']
      }
    }
  }
];
