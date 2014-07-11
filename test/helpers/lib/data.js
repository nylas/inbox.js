function __extend(obj, newContent) {
  if (obj && typeof obj === 'object') {
    if (IsArray(obj)) {
      return Merge(Merge([], obj), newContent);
    } else {
      return Merge(Merge({}, obj), newContent);
    }
  }
}

// random integer between inclusive min and inclusive max
function __randomInt(min, max) {
  min = min >>> 0;
  max = max >>> 0;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


var __b36 = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
             'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
             'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
             'u', 'v', 'w', 'x', 'y', 'z'];

function __randomBase36(digits) {
  if (typeof digits !== 'number' || i <= 0 || i !== i) {
    digits = 20;
  }

  var i;
  var str = '';
  for (i=0; i<digits; ++i) {
    str += __b36[__randomInt(0, __b36.length - 1)];
  }
  return str;
}
