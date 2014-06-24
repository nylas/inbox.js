}

if (typeof angular === 'object' && angular && typeof angular.module === 'function') {
  // AngularJS already loaded, register Inbox modules
  setup(window, angular);
} else if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
  // RequireJS
  // TODO: don't assume AngularJS module is named 'angular'
  define(['angular'], function(angular) {
    setup(window, angular);
  });
} else if (typeof module === 'object') {
  // CommonJS/Browserify
  // TODO: don't assume AngularJS module is named 'angular'
  setup(window, require('angular'));
}

})(this);
