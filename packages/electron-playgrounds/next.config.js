const withCSS = require('@zeit/next-css');
const DotenvPlugin = require('dotenv-webpack');
const globby = require('globby');
const {app: {rendererSource}} = require('./package.json');

module.exports = withCSS({
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
      use: {
        loader: 'url-loader',
      },
    });

    config.plugins.push(new DotenvPlugin());

    return config;
  },
  exportPathMap() {
    return globby([`${rendererSource}/pages/**/*.js`])
      .then((paths) => paths
        .map((path) => {
          const [,, pageToken] = path.split(/(pages|\.)/);
          return pageToken;
        })
        .filter((pageToken) => !pageToken.startsWith('/_'))
        .reduce((res, pageToken) => {
          const page = pageToken.replace(/^\/index$/, '/');
          return {
            ...res,
            [page]: {page},
          };
        }, {}));
  },
});
