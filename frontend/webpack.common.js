/* eslint-disable import/no-extraneous-dependencies, @typescript-eslint/no-var-requires */
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const AppManifestWebpackPlugin = require('app-manifest-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (webpackEnv) => {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  // common function to get style loaders
  const getStyleLoaders = options => [
    isEnvDevelopment && {
      loader: require.resolve('style-loader'),
    },
    isEnvProduction && {
      loader: MiniCssExtractPlugin.loader,
    },
    { loader: require.resolve('css-loader'), options },
  ].filter(Boolean);

  return {
    entry: [
      isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
      path.resolve(__dirname, './src/index.tsx'),
    ].filter(Boolean),
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    output: {
      filename: '[name].bundle.js',
      path: path.resolve(__dirname, './dist'),
    },
    optimization: {
      minimize: isEnvProduction,
      minimizer: [
        // This is only used in production mode
        new TerserPlugin({
          terserOptions: {
            parse: { ecma: 8 },
            compress: { ecma: 5, warnings: false, comparisons: false, inline: 2 },
            mangle: { safari10: true },
            output: { ecma: 5, comments: false, ascii_only: true },
          },
          parallel: true,
          cache: true,
          sourceMap: false,
        }),
        new OptimizeCSSAssetsPlugin(),
      ],
      splitChunks: { chunks: 'all', name: false },
      runtimeChunk: true,
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          loader: require.resolve('babel-loader'),
          exclude: /node_modules/,
        },
        // css-modules
        {
          test: /\.css$/,
          exclude: /node_modules|\.non-module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: isEnvDevelopment,
            modules: true,
          }),
        },
        // non-css-modules
        {
          test: /\.css$/,
          include: /node_modules|\.non-module\.css$/,
          use: getStyleLoaders({
            importLoaders: 1,
            sourceMap: isEnvDevelopment,
            modules: false,
          }),
        },
        {
          test: /.svg$/,
          use: {
            loader: require.resolve('@svgr/webpack'),
            options: { icon: true },
          },
        },
        {
          test: /\.(png|jpg|gif)$/i,
          use: {
            loader: require.resolve('url-loader'),
            options: { limit: 8192 },
          },
        },
        {
          test: /\.(eot|woff|woff2|ttf)$/,
          use: { loader: require.resolve('file-loader') },
        },
        {
          type: 'javascript/auto',
          test: /\.(json)/,
          exclude: /(node_modules)/,
          use: [{
            loader: require.resolve('file-loader'),
            options: { name: '[name].[ext]' },
          }],
        },
      ],
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin(
        Object.assign({}, {
          inject: true,
          template: './public/index.html',
        },
        isEnvProduction ? {
          minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
            removeEmptyAttributes: true,
            removeStyleLinkTypeAttributes: true,
            keepClosingSlash: true,
            minifyJS: true,
            minifyCSS: true,
            minifyURLs: true,
          },
        } : {}),
      ),
      isEnvProduction && new MiniCssExtractPlugin({
        // Options similar to the same options in webpackOptions.output
        // both options are optional
        filename: 'static/css/[name].[contenthash:8].css',
        chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      }),
      new AppManifestWebpackPlugin({
        logo: './src/assets/favicon/icon.svg',
        inject: true,
        persistentCache: true,
      }),
    ].filter(Boolean),
  };
};
