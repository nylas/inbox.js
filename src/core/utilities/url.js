/**
 * @function
 * @name formatUrl
 * @private
 *
 * @description
 * Given a template string, replace each `%@` in the string with a stringified value (arguments
 * following the template).
 *
 * E.G, formatString('%@, %@!', 'Hello', 'World') -> 'Hello, World!'
 *
 * This is similar to {formatString}, with the exception that for parameter names, leading and
 * trailing slashes are removed automatically.
 *
 * @param {string} template the string template to process.
 * @param {...*} args values to replace the instances of `%@` in the template string.
 *
 * @returns {string} the processed string.
 */
function formatUrl(template, args) {
  var i = 0;
  var ii;
  args = Array.prototype.slice.call(arguments, 1);
  ii = args.length;

  return template.replace(/\%\@/g, function() {
    if (i < ii) {
      var str = args[i++];
      if (typeof str === 'undefined') return '';
      return ('' + str).
        replace(/^\/+/, '').
        replace(/\/+$/, '');
    }
    return '';
  });
}

var ARRAY_BRACKET_REGEXP = /\[\]$/;

function buildURLParams(key, value, add) {
  var i, ii, name, v, classicArray = false;
  if (isArray(value)) {
    classicArray = key.test(ARRAY_BRACKET_REGEXP);
    for (i = 0, ii = value.length; i < ii; ++i) {
      v = value[i];
      if (classicArray) {
        add(key, v);
      } else {
        buildURLParams(key + '[' + (typeof v === 'object' ? i : '') + ']', v, add);
      }
    }
  } else if (typeof value === 'object') {
    for (name in value) {
      buildURLParams(key + '[' + name + ']', value[name], add);
    }
  } else {
    add(key, value);
  }
}

// Based on jQuery.param (2.x.x)
function serializeURLParams(params) {
  var key, s;
  function add(key, value) {
    value = typeof value === 'function' ? value() : value == null ? '' : value;
    s[s.length] = encodeURIComponent(key) + '=' + encodeURIComponent(value);
  }

  if (typeof params === 'object') {
    s = [];
    for (key in params) {
      if (params.hasOwnProperty(key)) {
        buildURLParams(key, params[key], add);
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
  'any_email': 'any_email',
  'from': true,
  'to': true,
  'cc': true,
  'bcc': true,
  'thread_id': true,
  'message_id': true,
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
  'thread_id': true,
  'message_id': true,
  'tag': true,
  'filename': true
};

var FILTER_INTS = {
  'limit': true,
  'offset': true
};

var INT_REGEXP = /^((0x[0-9a-f]+)|([0-9]+))$/i;


/**
 * @function
 * @name applyFilters
 * @private
 *
 * @description
 * Apply a collection of filters to a URL (returns a query string).
 *
 * Supported filters include:
 *   - subject
 *       Return messages or threads with a subject matching this string or regular expression.
 *
 *   - email
 *       Return messages or threads in which this email address has participated, either as a
 *       sender, receiver, CC or BCC.
 *
 *   - from
 *       Return messages or threads sent by this participant
 *
 *   - to
 *       Return messages or threads in which this participant has been the recipient
 *
 *   - cc
 *       Return messages or threads in which this participant has been CC'd
 *
 *   - bcc
 *       Return messages or threads in which this participant has been BCC'd
 *
 *   - thread
 *       Return messages, files or drafts attached to this thread.
 *
 *   - tag
 *       Return messages or threads tagged with this tag.
 *
 *   - filename
 *       Return files with this matching filename, or threads/messages where this filename was
 *       attached.
 *
 *   - lastMessageBefore
 *       Return threads whose last message arrived before this date.
 *
 *   - lastMessageAfter
 *       Return threads whose last message arrived after this date.
 *
 *   - startedBefore
 *       Return messages or threads which started before this date.
 *
 *   - startedAfter
 *       Return messages or threads which started after this date.
 *
 *   - limit
 *       The maximum number of items to return from the server. The server will impose a default
 *       limit even if this value is not specified.
 *
 *   - offset
 *       The offset in the collection of records, useful for pagination.
 *
 * @param {object} filters A collection of filters to use.
 *
 * @returns {string}| A query string, or the empty string if no filters are used.
 */
function applyFilters(filters) {
  var params;
  var key;
  var value;
  var result = '';
  if (!filters || typeof filters !== 'object' || isArray(filters)) {
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
        value = toUnixTimestamp(value);
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

  result = serializeURLParams(params);
  return result ? '?' + result : '';
}
