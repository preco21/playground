// Stolen from https://github.com/twopluszero/next-images
module.exports = (nextConfig = {}) => ({
  ...nextConfig,
  webpack(config, options) {
    const {isServer} = options;
    const {
      inlineImageLimit = 8192,
      assetPrefix = '',
      webpack,
    } = nextConfig;

    config.module.rules.push({
      test: /\.(jpe?g|png|gif|ico|webp)$/,
      loader: 'url-loader',
      options: {
        limit: inlineImageLimit,
        fallback: 'file-loader',
        publicPath: `${assetPrefix}/_next/static/images/`,
        outputPath: `${isServer ? '../' : ''}static/images/`,
        name: '[name]-[hash].[ext]',
      },
    });

    config.module.rules.push({
      test: /\.svg$/,
      loader: 'svg-url-loader',
      options: {
        limit: inlineImageLimit,
        noquotes: true,
      },
    });

    if (typeof webpack === 'function') {
      return webpack(config, options);
    }

    return config;
  },
});