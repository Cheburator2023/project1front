const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

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
    new ReactRefreshWebpackPlugin({ overlay: false }),
    new DefinePlugin({
      'process.env.MOCKED_REQUESTS': JSON.stringify(process.env.MOCKED_REQUESTS || ''),
    }),
  ],
  watchOptions: {
    poll: 10000,
    ignored: /node_modules/,
  },
  devServer: {
    static: './',
    port: 8001,
    historyApiFallback: { disableDotRule: true },
    hot: true,
    allowedHosts: ['all'],
    client: {
      overlay: {
        runtimeErrors: (error) => {
          const ignoreErrors = ['ResizeObserver loop completed with undelivered notifications.'];
          return !ignoreErrors.includes(error.message);
        },
      },
    },
  },
});

