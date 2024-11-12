const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const { DefinePlugin } = webpack;

const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  cache: false,
  optimization: {
    minimize: false,
  },
  plugins: [
    new DefinePlugin({
      'process.env.MOCKED_REQUESTS': JSON.stringify(process.env.MOCKED_REQUESTS || ''),
    }),
  ],
  devServer: {
    static: './',
    port: 8001,
    historyApiFallback: { disableDotRule: true },
    hot: true,
    allowedHosts: ['all'],
  },
});

