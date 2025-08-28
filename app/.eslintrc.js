module.exports = {
  root: true,
  env: { es6: true, node: true, browser: true },
  parser: '@babel/eslint-parser',
  parserOptions: { requireConfigFile: false, ecmaFeatures: { jsx: true } },
  extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/prop-types': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'no-console': 'off',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'build/'],
};
