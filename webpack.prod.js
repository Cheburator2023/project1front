const { merge } = require('webpack-merge');
const webpack = require('webpack');

const { DefinePlugin } = webpack;
const common = require('./webpack.common.js');
const packageJSON = require('./package.json');

const git_revision = require('child_process')
  .execSync('git show --format="short" -s')
  .toString()
  .trim();

const RC_STATS = packageJSON.release_stats;
const NO_ROLES = process.env.NO_ROLES;

module.exports = merge(common, {
  mode: 'production',
  devtool: 'cheap-module-source-map',
  cache: false,
  output: {
    publicPath: '/sum-rm/',
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new DefinePlugin({
      'process.env.MOCKED_REQUESTS': JSON.stringify(process.env.MOCKED_REQUESTS || ''),
      'process.env.RC_STATS': JSON.stringify(RC_STATS || ''),
      'process.env.GIT_REVISION': JSON.stringify(git_revision || ''),
      'process.env.NO_ROLES': JSON.stringify(NO_ROLES || ''),
      'process.env.API_BASE_URL': JSON.stringify(''),
    }),
  ],
});

