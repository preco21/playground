const {resolve} = require('path');
const {HashedModuleIdsPlugin} = require('webpack');
const {smart: webpackMergeSmart} = require('webpack-merge');
const nodeExternals = require('webpack-node-externals');
const CleanPlugin = require('clean-webpack-plugin');
const DotenvPlugin = require('dotenv-webpack');
const WebpackBarPlugin = require('webpackbar');
const SizePlugin = require('size-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const {
  app: {
    mainSource,
    appDest,
    cleanPaths = [],
  },
} = require('./package.json');

module.exports = (env = {}, argv = {}) => {
  const mode = env.mode || argv.mode;
  const isDev = mode === 'development';

  process.env.BABEL_ENV = `main-${mode}`;

  const shouldSupportSourceMap = !process.env.NO_SOURCE_MAP_SUPPORT;
  const chooseSourceMap = () => {
    if (shouldSupportSourceMap) {
      return isDev
        ? 'cheap-module-source-map'
        : 'nosources-source-map';
    }

    return undefined;
  };

  const sharedConfig = {
    mode,
    devtool: chooseSourceMap(),
    output: {
      path: resolve(__dirname, appDest),
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: resolve(__dirname, mainSource),
          loader: 'babel-loader',
          options: {
            cacheDirectory: isDev,
          },
        },
      ],
    },
    plugins: [
      !isDev && new HashedModuleIdsPlugin(),
      new DotenvPlugin(),
      new WebpackBarPlugin(),
      new SizePlugin(),
    ].filter(Boolean),
    optimization: {
      minimizer: [
        new TerserPlugin({
          sourceMap: shouldSupportSourceMap,
          cache: true,
          parallel: true,
          terserOptions: {
            mangle: false,
          },
        }),
      ],
    },
    externals: [
      nodeExternals(),
      nodeExternals({
        modulesDir: resolve(__dirname, '../../node_modules'),
      }),
    ],
    node: {
      __dirname: false,
      __filename: false,
    },
    performance: {
      hints: false,
    },
  };

  return [
    webpackMergeSmart({
      target: 'electron-main',
      entry: [
        shouldSupportSourceMap && `./${mainSource}/internals/source-map-support.js`,
        `./${mainSource}/index.js`,
      ].filter(Boolean),
      output: {
        filename: 'index.js',
      },
      plugins: [
        new CleanPlugin(cleanPaths),
      ],
    }, sharedConfig),
    webpackMergeSmart({
      target: 'electron-renderer',
      entry: [
        shouldSupportSourceMap && `./${mainSource}/internals/source-map-support.js`,
        `./${mainSource}/preload.js`,
      ].filter(Boolean),
      output: {
        filename: 'preload.js',
      },
    }, sharedConfig),
  ];
};
