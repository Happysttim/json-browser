module.exports = {
    ignorePatterns: [
      '.eslintrc.js',
      '/node_modules/'
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/stylistic-type-checked',
      'plugin:@typescript-eslint/recommended-type-checked'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      project: true,
      __tsconfigRootDir: __dirname,
    },
    root: true,
    rules: {
      'semi': ['error', 'always'],
      'quotes': ['error', 'double'],
      'indent': ['error', 4],
      'no-empty': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-empty-function': 'warn',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'no-useless-escape': 'off'
    }
  };
  