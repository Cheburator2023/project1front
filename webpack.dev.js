const { merge } = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const { DefinePlugin } = webpack;

const common = require('./webpack.common.js');
const packageJSON = require('./package.json');
const { readChangelogVersion } = require('./webpack.version.js');
const git_revision = require('child_process')
  .execSync('git show --format="short" -s')
  .toString()
  .trim();

const RC_STATS = packageJSON.release_stats;
const NO_ROLES = process.env.NO_ROLES;
const { version: APP_VERSION, date: APP_VERSION_DATE } = readChangelogVersion();

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
      'process.env.NO_ROLES': JSON.stringify(NO_ROLES || ''),
      'process.env.API_BASE_URL': JSON.stringify('http://localhost:3000'),
      'process.env.APP_VERSION': JSON.stringify(APP_VERSION),
      'process.env.APP_VERSION_DATE': JSON.stringify(APP_VERSION_DATE),
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
        { from: /^\/.*$/, to: '/index.html' },
      ],
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

