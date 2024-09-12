const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;

const federationConfig = require('./federation.config.json');
const deps = require('./package.json').dependencies;

const SRC_DIR = path.join(__dirname, './src');

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
      ...federationConfig,
      filename: 'remoteEntry.js',
      shared: {
        ...deps,
        react: {
          singleton: true,
          eager: true,
          requiredVersion: deps.react,
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: deps['react-dom'],
        },
        'react-router-dom': {
          singleton: true,
          eager: true,
          requiredVersion: deps['react-router-dom'],
        },
        '@mui/material': {
          singleton: true,
          eager: true,
          requiredVersion: deps['@mui/material'],
        },
        '@admiral-ds/icons': {
          singleton: true,
          eager: true,
          requiredVersion: deps['@admiral-ds/icons'],
        },
        '@admiral-ds/react-ui': {
          singleton: true,
          eager: true,
          requiredVersion: deps['@admiral-ds/react-ui'],
        },
        'styled-components': {
          singleton: true,
          eager: true,
          requiredVersion: deps['styled-components'],
        },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      excludeChunks: ['sumRM'],
    }),
  ],
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/',
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
      {
        test: /bootstrap\.tsx$/,
        loader: 'bundle-loader',
        options: {
          lazy: true,
        },
      },
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
