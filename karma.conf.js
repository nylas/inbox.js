module.exports = function(config) {
  config.set({
    logLevel: config.LOG_DEBUG,
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    
    files: [
      'src/core/**/*.js',
      'test/helpers/**/*.js',
      'src/angular/module.js',
      'test/**/*.js'
    ],

    reporters: ['dots']
  });
};
