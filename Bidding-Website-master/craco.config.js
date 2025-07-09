const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Disable CSS minimization in production to avoid CSS variable issues
      if (env === 'production') {
        // Remove CSS minimizer completely to avoid CSS variable issues
        if (webpackConfig.optimization && webpackConfig.optimization.minimizer) {
          webpackConfig.optimization.minimizer = webpackConfig.optimization.minimizer.filter(
            minimizer => minimizer.constructor.name !== 'CssMinimizerPlugin'
          );
        }
      }

      return webpackConfig;
    },
  },
  // Remove the style configuration to let PostCSS config file handle it
};
