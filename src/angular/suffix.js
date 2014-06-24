  return module;
}

if (typeof angular === 'object' && angular && typeof angular.module === 'function') {
  // AngularJS already loaded, register Inbox modules
  setup(window, angular);
} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
  // RequireJS
  // TODO: don't assume AngularJS module is named 'angular'
  define(['angular'], function(angular) {
    return setup(window, angular);
  });
} else if (typeof module === 'object' && typeof require === 'function') {
  // CommonJS/Browserify
  // TODO: don't assume AngularJS module is named 'angular'
  var angular = require('angular');
  module.exports = setup(window, angular);
}

})(this);
