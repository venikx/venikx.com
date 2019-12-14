module.exports = {
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    strict: 0,
  },
  extends: ['prettier', 'eslint:recommended', 'plugin:gridsome/recommended'],
  plugins: ['gridsome'],
  env: {
    browser: true,
    es6: true,
  },
}
