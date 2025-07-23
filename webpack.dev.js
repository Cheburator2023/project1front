const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const { DefinePlugin } = webpack;

const common = require('./webpack.common.js');
const packageJSON = require('./package.json');
const git_revision = require('child_process')
  .execSync('git show --format="short" -s')
  .toString()
  .trim();

const RC_STATS = packageJSON.release_stats;

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
      'process.env.RC_STATS': JSON.stringify(RC_STATS || ''),
      'process.env.GIT_REVISION': JSON.stringify(git_revision || ''),
    }),
  ],
  watchOptions: {
    poll: 10000,
    ignored: /node_modules/,
  },
  devServer: {
    static: './',
    port: 8001,
    hot: true,
    allowedHosts: ['all'],
    historyApiFallback: {
      // disableDotRule: true ,
      rewrites: [
        // Exclude remoteEntry.js from SPA routing
        { from: /^\/remoteEntry\.js$/, to: '/remoteEntry.js' },
        // Other SPA routes still work
        { from: /^\/.*$/, to: '/index.html' }
      ]
    },
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

