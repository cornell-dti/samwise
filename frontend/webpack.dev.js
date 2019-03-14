/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const merge = require('webpack-merge');
const commonFunction = require('./webpack.common.js');

module.exports = merge(commonFunction('development'), {
  devServer: {
    contentBase: './dist',
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  mode: 'development',
});
