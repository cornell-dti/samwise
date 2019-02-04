/* eslint-disable import/no-extraneous-dependencies */
const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
  devServer: {
    contentBase: './dist',
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  mode: 'development',
});
