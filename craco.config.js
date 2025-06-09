const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@components': path.resolve(__dirname, 'src/components'),
        '@context': path.resolve(__dirname, 'src/context'),
      };
      return webpackConfig;
    },
  },
};
