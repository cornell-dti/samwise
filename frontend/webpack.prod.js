/* eslint-disable import/no-extraneous-dependencies */
const webpack = require('webpack');
const merge = require('webpack-merge');
const commonFunction = require('./webpack.common.js');

module.exports = merge(commonFunction('production'), {
  mode: 'production',
  plugins: [
    new webpack.DefinePlugin({ 'process.env': { IS_STAGING: '"false"' } }),
  ],
});
