
function Merge(dest, src) {
  var key;
  var a;
  var b;
  for (key in src) {
    if (key !== '_' && src.hasOwnProperty(key)) {
      b = src[key];
      if (dest.hasOwnProperty(key)) {
        a = dest[key];
        if (typeof a === 'object' && typeof b === 'object') {
          dest[key] = Merge(a, b);
          continue;
        }
        dest[key] = b;
      } else {
        dest[key] = b;
      }
    }
  }
  return dest;
}
