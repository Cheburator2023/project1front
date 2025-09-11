const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

const deps = require('./package.json').dependencies;

const SRC_DIR = path.join(__dirname, './src');
const TS_CONFIG_PATH = path.resolve(__dirname, './tsconfig.json');
const PUBLIC_PATH = process.env.PUBLIC_PATH || undefined;

const ALIAS = {
  '@src': `${SRC_DIR}`,
  '@shared': `${SRC_DIR}/shared`,
  '@app': `${SRC_DIR}/app`,
  '@entities': `${SRC_DIR}/entities`,
  '@pages': `${SRC_DIR}/pages`,
  '@features': `${SRC_DIR}/features`,
  '@widgets': `${SRC_DIR}/widgets`,
};

module.exports = {
  entry: {
    app: './src/index',
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'sumRM',
      exposes: {
        './App': './src/indexFederated',
      },
      filename: 'remoteEntry.js',
      shared: {},
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      excludeChunks: ['sumRM'],
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: PUBLIC_PATH,
    clean: true,
  },
  resolve: {
    alias: ALIAS,
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    fallback: {
      url: false,
      path: false,
    },
  },
  module: {
    rules: [
      // {
      //   test: /bootstrap\.tsx$/,
      //   loader: 'bundle-loader',
      //   options: {
      //     lazy: true,
      //   },
      // },
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: ['@svgr/webpack'],
      },
      {
        test: /\.(gif|svg|jpg|png|otf|ttf)$/,
        use: 'file-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};

