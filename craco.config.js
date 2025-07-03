// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Turn off CSS minification plugin
      if (webpackConfig.optimization?.minimizer) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          (plugin) => plugin.constructor.name !== 'CssMinimizerPlugin'
        );
      }
      return webpackConfig;
    },
  },
};
