function URLAddPaths(url, paths) {
  var i;
  var ii;
  paths = Array.prototype.slice.call(arguments, 1);

  for (i = 0, ii = paths.length; i < ii; ++i) {
    if (url.charAt(url.length-1) !== '/') {
      url = url + '/';
    }
    url = url + paths[i];
  }
  return url;
}
