const { resolve } = require('node:path');

module.exports = {
  extends: [
    require.resolve('@vercel/style-guide/eslint/browser'),
    require.resolve('@vercel/style-guide/eslint/node'),
    require.resolve('@vercel/style-guide/eslint/typescript'),
    'plugin:jsx-a11y/recommended',
  ],

  plugins: ['jsx-a11y'],

  ignorePatterns: ['node_modules/', 'dist/'],
  rules: {
    'eslint-comments/require-description': 'off',
    '@typescript-eslint/no-confusing-void-expression': 'off',
    camelcase: [
      'error',
      {
        allow: ['^UNSAFE_', '^unstable_', '^experimental_'],
        ignoreDestructuring: false,
        properties: 'never',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'eslint-comments/require-description': 'off',
      },
    },
  ],
};
