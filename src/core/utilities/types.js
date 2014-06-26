var IsArray = (function() {
  if (typeof Array.isArray === 'function') {
    return Array.isArray;
  }
  return function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  };
})();
