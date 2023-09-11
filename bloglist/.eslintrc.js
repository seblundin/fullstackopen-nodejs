module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: ['airbnb-base', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    eqeqeq: 'error',
    'no-console': 1,
    'no-underscore-dangle': 0,
    'require-await': 2,
    'consistent-return': 0,
  },
};
