const DotenvPlugin = require('dotenv-webpack');
const withPlugins = require('next-compose-plugins');
const withCSS = require('@zeit/next-css');
const withFonts = require('next-fonts');

function withImagesCustom(nextConfig = {}) {
  return {
    ...nextConfig,
    webpack(config, options) {
      const {isServer} = options;
      const {
        inlineImageLimit = 8192,
        assetPrefix = '',
        webpack,
      } = nextConfig;

      config.module.rules.push({
        test: /\.(jpe?g|png|gif|ico|webp|svg)$/,
        loader: 'url-loader',
        options: {
          limit: inlineImageLimit,
          fallback: 'file-loader',
          publicPath: `${assetPrefix}/_next/static/images/`,
          outputPath: `${isServer ? '../' : ''}static/images/`,
          name: '[name]-[hash].[ext]',
        },
      });

      if (typeof webpack === 'function') {
        return webpack(config, options);
      }

      return config;
    },
  };
}

module.exports = withPlugins([
  withCSS,
  withImagesCustom,
  withFonts,
], {
  webpack(config) {
    // HACK: Quick fix to resolve the custom babel config in root directory
    config.module.rules.forEach((rule) => {
      if (rule.use && rule.use.loader === 'next-babel-loader') {
        // eslint-disable-next-line no-param-reassign
        rule.use.options.cwd = undefined;
      }
    });

    config.plugins.push(new DotenvPlugin());

    return config;
  },
});
