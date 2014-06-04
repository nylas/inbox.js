module.exports = function(config) {
  config.set({
    logLevel: config.LOG_INFO,
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    
    files: [
      'test/helpers/**/*.js',
      'src/*/**/*.js',
      'test/**/*.js'
    ],

    reporters: ['dots']
  });
};
