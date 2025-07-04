// craco.config.js
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable CSS minification plugin (CssMinimizerPlugin)
      if (webpackConfig.optimization?.minimizer) {
        webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
          (plugin) => plugin.constructor.name !== 'CssMinimizerPlugin'
        );
      }

      // Merge fallback and alias with existing config, adding necessary polyfills
      webpackConfig.resolve = {
        ...webpackConfig.resolve,
        alias: {
          ...(webpackConfig.resolve.alias || {}),
          'process/browser': require.resolve('process/browser.js'), // key fix
        },
        fallback: {
          ...(webpackConfig.resolve.fallback || {}),
          fs: false,
          module: false,
          v8: false,
          perf_hooks: false,
          path: require.resolve('path-browserify'),
          os: require.resolve('os-browserify/browser'),
          crypto: require.resolve('crypto-browserify'),
          stream: require.resolve('stream-browserify'),
          assert: require.resolve('assert'),
          util: require.resolve('util'),
          url: require.resolve('url'),
          process: require.resolve('process/browser.js'),
          vm: require.resolve('vm-browserify'),
          tty: require.resolve('tty-browserify'),
        },
      };

      // Add ProvidePlugin for process and Buffer globally
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );

      return webpackConfig;
    },
  },

  style: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
};
