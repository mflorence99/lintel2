// 📘 eslint data structures

export type Config = {
  files: (string | string[])[];
  ignores: string[];
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
  processor: any;
  rules: Record<string, number | string | string[]>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleConfig: Partial<Config> = {
  files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  rules: {
    'constructor-super': 'off',
    'getter-return': 'off',
    'no-class-assign': 'off',
    'no-const-assign': 'off',
    'no-dupe-args': 'off',
    'no-dupe-class-members': 'off',
    'no-dupe-keys': 'off',
    'no-func-assign': 'off',
    'no-import-assign': 'off',
    'no-new-symbol': 'off',
    'no-new-native-nonconstructor': 'off',
    'no-obj-calls': 'off',
    'no-redeclare': 'off',
    'no-setter-return': 'off',
    'no-this-before-super': 'off',
    'no-undef': 'off',
    'no-unreachable': 'off',
    'no-unsafe-negation': 'off',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error'
  },
  name: 'typescript-eslint/eslint-recommended'
};

export type Rule = {};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleRule: Partial<Rule> = {
  name: 'accessor-pairs',
  rule: {
    meta: {
      type: 'suggestion',
      defaultOptions: [
        {
          enforceForClassMembers: true,
          getWithoutSet: false,
          setWithoutGet: true
        }
      ],
      docs: {
        description:
          'Enforce getter and setter pairs in objects and classes',
        recommended: false,
        url: 'https://eslint.org/docs/latest/rules/accessor-pairs'
      },
      schema: [
        {
          type: 'object',
          properties: {
            getWithoutSet: {
              type: 'boolean'
            },
            setWithoutGet: {
              type: 'boolean'
            },
            enforceForClassMembers: {
              type: 'boolean'
            }
          },
          additionalProperties: false
        }
      ],
      messages: {
        missingGetterInPropertyDescriptor:
          'Getter is not present in property descriptor.',
        missingSetterInPropertyDescriptor:
          'Setter is not present in property descriptor.',
        missingGetterInObjectLiteral:
          'Getter is not present for {{ name }}.',
        missingSetterInObjectLiteral:
          'Setter is not present for {{ name }}.',
        missingGetterInClass:
          'Getter is not present for class {{ name }}.',
        missingSetterInClass:
          'Setter is not present for class {{ name }}.'
      }
    }
  }
};
