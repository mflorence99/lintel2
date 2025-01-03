// 📘 eslint data structures

export type ESLintConfig = {
  files: (string | string[])[];
  ignores?: string[];
  language: string;
  languageOptions: {
    ecmaVersion: string;
    parser: {
      meta: {
        name: string;
        version: string;
      };
    };
    parserOptions: Record<string, string | string[]>;
    sourceType: string;
  };
  linterOptions: Record<string, number | string>;
  name: string;
  plugins: Record<string, any>;
  rules: Record<string, number | string | string[]>;
};
