const { merge } = require('webpack-merge');
const webpack = require('webpack');

const { DefinePlugin } = webpack;
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new DefinePlugin({
      'process.env.MOCKED_REQUESTS': JSON.stringify(process.env.MOCKED_REQUESTS || ''),
    }),
  ],
});

