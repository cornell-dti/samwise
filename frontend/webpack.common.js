/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.jsx',
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    splitChunks: { chunks: 'all', name: false },
    runtimeChunk: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' },
      },
      {
        test: /\.css$/,
        exclude: /node_modules|src\/index.css/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: { modules: true, camelCase: true, sourceMap: true },
          },
        ],
      },
      {
        test: /\.css$/,
        include: /node_modules|src\/index.css/,
        use: [
          { loader: 'style-loader' },
          {
            loader: 'css-loader',
            options: { modules: false, camelCase: true, sourceMap: true },
          },
        ],
      },
      {
        test: /\.(png|jpg|gif|svg)$/i,
        use: { loader: 'url-loader', options: { limit: 8192 } },
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        use: { loader: 'file-loader' },
      },
      {
        type: 'javascript/auto',
        test: /\.(json)/,
        exclude: /(node_modules)/,
        use: [{
          loader: 'file-loader',
          options: { name: '[name].[ext]' },
        }],
      },
    ],
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, './dist'),
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
    new HtmlWebpackPlugin({ template: './public/index.html' }),
  ],
};
