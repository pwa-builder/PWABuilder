const mocha = require('./.mocharc.json');

module.exports = function (config) {
  config.set({
    frameworks: ['mocha', 'chai'], //, 'karma-typescript'],
    // files: ['unit_tests/**/*.karma.ts'],
    files: ['unit_tests/**/*.karma.js'],
    exclude: ['node_modules'],
    colors: true,
    logLevel: config.LOG_INFO,
    // preprocessors: {
    //   '**/*.ts': 'karma-typescript',
    // },
    // autoWatch: true,
    // singleRun: true,
    
    reporters: ['progress', 'coverage'], // , 'karma-typescript'],
    browsers: ['ChromeHeadless'],
    client: {
      mocha: {
        ...mocha,
        reporter: 'html',
        timeout: '5000',
      },
    },
  });
};
