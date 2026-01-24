module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ігнорувати попередження про критичні залежності від react-datepicker
      webpackConfig.ignoreWarnings = [
        {
          module: /node_modules\/react-datepicker/,
          message:
            /Critical dependency: the request of a dependency is an expression/,
        },
      ];
      return webpackConfig;
    },
  },
};
