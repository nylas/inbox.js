if (typeof define === 'function' && typeof define.amd === 'object' && define.amd) {
  // RequireJS
  define(function(angular) {
    return InboxAPI;
  });
} else if (typeof module === 'object' && typeof require === 'function') {
  // CommonJS/Browserify
  module.exports = InboxAPI;
} else {
  window.InboxAPI = InboxAPI;
}

})(this);
