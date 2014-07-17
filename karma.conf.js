module.exports = function(config) {
  config.set({
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    
    files: [
      'src/core/utilities/*.js',
      'src/core/**/*.js',
      'test/helpers/**/*.js',
      'src/angular/module.js',
      'test/**/*.js'
    ],

    reporters: ['dots']
  });
};
