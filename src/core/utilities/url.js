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

function URLFormat(template, args) {
  var i = 0;
  var ii;
  args = Array.prototype.slice.call(arguments, 1);
  ii = args.length;

  return template.replace(/\%\@/g, function() {
    if (i < ii) {
      return ('' + args[i++]).
        replace(/^\/+/, '').
        replace(/\/+$/, '');
    }
    return '';
  });
}

var ARRAY_BRACKET_REGEXP = /\[\]$/;

function BuildURLParams(key, value, add) {
  var i, ii, name, v, classicArray = false;
  if (IsArray(value)) {
    classicArray = key.test(ARRAY_BRACKET_REGEXP);
    for (i=0, ii=value.length; i<ii; ++i) {
      v = value[i];
      if (classicArray) {
        add(key, v);
      } else {
        BuildURLParams(key + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
      }
    }
  } else if (typeof value === 'object') {
    for (name in value) {
      BuildURLParams(key + '[' + name + ']', value[name], add);
    }
  } else {
    add(key, value);
  }
}

// Based on jQuery.param (2.x.x)
function SerializeURLParams(params) {
  var key, s;
  function add(key, value) {
    value = typeof value === 'function' ? value() : value == null ? '' : value;
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  if (typeof params === 'object') {
    s = [];
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        BuildURLParams(key, params[key], add);
      }
    }
  }

  return s.join('&').replace(/%20/, '+');
}

// supported filter options. if their value is 'true', their new key is the same as their old key.
// if their value is a string, it is the name of their valid key.
var FILTER_NAMES_OPTS = {
  'subject': true,
  'email': 'any_email',
  'from': true,
  'to': true,
  'cc': true,
  'bcc': true,
  'thread': true,
  'tag': true,
  'filename': true,
  'lastMessageBefore': 'last_message_before',
  'lastMessageAfter': 'last_message_after',
  'startedBefore': 'started_before',
  'startedAfter': 'started_after',
  'limit': true,
  'offset': true
};

// After converting to filtered names, these parameters must be converted to unix timestamps.
var FILTER_DATES = {
  'last_message_before': true,
  'last_message_after': true,
  'started_before': true,
  'started_after': true
};

var FILTER_REGEXPS = {
  'subject': true
};

var FILTER_STRINGS = {
  'subject': true,
  'any_email': true,
  'from': true,
  'to': true,
  'cc': true,
  'bcc': true,
  'thread': true,
  'tag': true,
  'filename': true
};

var FILTER_INTS = {
  'limit': true,
  'offset': true
};

var INT_REGEXP = /^((0x[0-9a-f]+)|([0-9]+))$/i;

function InboxURLFilters(filters) {
  var params;
  var key;
  var value;
  var result = '';
  if (!filters || typeof filters !== "object" || IsArray(filters)) {
    return '';
  }

  params = {};

  for (key in filters) {
    value = FILTER_NAMES_OPTS[key];
    if (value === true) {
      params[key] = filters[key];
    } else if (typeof value === 'string') {
      params[value] = filters[key];
    }
  }

  for (key in params) {
    value = params[key];
    if (typeof value === 'function') {
      value = value();
    }

    if (FILTER_DATES[key] === true) {
      if (typeof value === 'number' || typeof value === 'string' || typeof value === 'object') {
        value = ToUnixTimestamp(value);
        params[key] = value;
        if (typeof value === 'number' && ((value !== value) || (Math.abs(value) === Infinity))) {
          // NaN/Infinity timestamp --- don't send.
          delete params[key];
        }
      } else {
        // Invalid timestamp
        delete params[key];
      }
    } else if (FILTER_REGEXPS[key] === true && params[key] instanceof RegExp) {
      params[key] = params[key].toString();
    } else if (FILTER_INTS[key] === true) {
      if ((typeof value === 'string' && INT_REGEXP.test(value)) || typeof value === 'number') {
        value = Number(value);
        if (value === value && Math.abs(value) !== Infinity) {
          params[key] = value;
        } else {
          delete params[key];
        }
      } else {
        delete params[key];
      }
    }
    if (FILTER_STRINGS[key] === true && typeof params[key] === 'object') {
      delete params[key];
    }
  }

  result = SerializeURLParams(params);
  return result ? '?' + result : '';
}
