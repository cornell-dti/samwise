/* eslint-disable @typescript-eslint/no-var-requires */
const { defaults } = require('jest-config');

module.exports = {
  ...defaults,
  transform: {
    ...defaults.transform,
    '^.+\\.[tj]sx?$': 'babel-jest',
    '.+\\.(css|styl|less|sass|scss)$': './node_modules/jest-css-modules-transform',
  },
};
