// ESLint flat config for Expo/React Native app (ESLint v9) - CommonJS
const js = require('@eslint/js');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const tseslint = require('typescript-eslint');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
  // Base recommended rules
  js.configs.recommended,
  // TypeScript recommended configs (includes parser)
  ...tseslint.configs.recommended,

  // Ignore common config/build artifacts from linting
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.expo/**',
      'eslint.config.*',
      '.eslintrc.*',
      'metro.config.*',
      'babel.config.*',
      'webpack.config.*',
    ],
  },

  // App source (JS/TS/React Native)
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: {
        // Browser/React Native globals used in this app
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@typescript-eslint': tseslint.plugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React specifics
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Prefer warnings for common dev-time issues to keep CI green
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',

      // Allow common expression patterns (short-circuit, ternary) used in RN
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        { allowShortCircuit: true, allowTernary: true, enforceForJSX: false },
      ],

      // Be lenient on empty blocks (often used for try/catch placeholders)
      'no-empty': 'off',

      // Don't fail builds on 'any' usage in quick prototypes
      '@typescript-eslint/no-explicit-any': 'warn',

      // Hooks recommended
      ...reactHooksPlugin.configs.recommended.rules,

      // Disable undefined checks; globals set above and RN env may vary
      'no-undef': 'off',
    },
  },

  // Node/CommonJS for config files
  {
    files: ['eslint.config.*', '.eslintrc.*', 'metro.config.*', 'babel.config.*', 'webpack.config.*'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'readonly', require: 'readonly', __dirname: 'readonly', process: 'readonly' },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },

  // Disable stylistic rules that conflict with Prettier
  prettierConfig,
];
