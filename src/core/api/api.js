var ERROR = {};

var DEFAULT_HTTP = {
  
};

function NativePromiseWrapper(resolve, reject) {
  return new window.Promise(resolve, reject);
}

/**
 * @class InboxAPI
 *
 * Class which represents a specific Inbox web service. From here, it's possible to query for and
 * construct InboxNamespace objects, which represent email addresses associated with an account.
 *
 * @param {object|string} optionsOrAppId An object containing configuration kes, or alternatively
 *   a string containing the appId for communicating with the webservice.
 *
 * @param {string=} optionalBaseUrl A string containing the base URL for the Inbox web service. If
 *   the optionsOrAppId parameter is an object, then this field is not necessary. If not specified,
 *   the baseUrl will be "http://api.inboxapp.co/"
 *
 * @param {function=} optionalPromiseConstructor A function which, when called, returns an instance
 *   of an ES6-compatible Promise. If unspecified, window.Promise is used. Note that the Promise
 *   constructor must be callable without `new`, so for non-native Promises, one should specify a
 *   wrapper which constructs the associated promise.
 *
 * @throws {TypeError} The InboxAPI constructor will throw under the circumstances that we have
 *   no appId, no Promise implementation, or if any of the configuration parameters are not of
 *   the appropriate type.
 */
function InboxAPI(optionsOrAppId, optionalBaseUrl, optionalPromiseConstructor) {
  var options;
  var len;
  var args = arguments;

  if (optionsOrAppId && typeof optionsOrAppId === "object") {
    options = optionsOrAppId;
  } else {
    options = {};
    len = Math.min(args.length, 3) - 1;
    options.promise = typeof args[len] === 'function' ? args[len--] : window.Promise;
    options.baseUrl = len ?
      ((typeof args[len--] === 'string' || args[len+1] == null) ? args[len + 1] : ERROR) :
      null;
    options.appId = args[len];
  }

  if (options.appId == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing `appId`.");
  } else if (typeof options.appId !== 'string') {
    throw new TypeError("Unable to construct 'InboxAPI': option `appId` must be a string.");
  }

  if (options.baseUrl == null) {
    options.baseUrl = 'http://api.inboxapp.co/';
  } else if (typeof options.baseUrl !== 'string') {
    throw new TypeError("Unable to construct 'InboxAPI': option `baseUrl` must be a string.");
  }

  if (options.promise == null) {
    options.promise = window.Promise;
  }

  if (options.promise == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `promise`, " +
                        "or no native Promise available");
  } else if (typeof options.promise !== 'function') {
    throw new TypeError("Unable to construct 'InboxAPI': option `promise` must be a " +
                        "function which returns an ECMAScript6-compatible Promise");
  }

  if (options.promise === window.Promise) {
    options.promise = NativePromiseWrapper;
  }

  if (!(this instanceof InboxAPI)) {
    return new InboxAPI(options);
  }

  options._cache = {};

  options.http = Merge(Merge({}, DEFAULT_HTTP), (typeof options.http === 'object' && options.http));

  this._ = options;
  DefineProperty(this, '_', INVISIBLE);
}

/**
 * @method InboxAPI#http
 *
 * Return or modify InboxAPI instance's HTTP configuration. If called with no arguments, it will
 * return the HTTP configuration object. Otherwise, if passed a key, it will return the
 * configuration for that key (case-sensitive). Finally, if there is a value, the key will be
 * updated with that value, and the InboxAPI will be returned.
 *
 * @param {string=} key The optional key in the configuration object
 *
 * @param {*=} value The value which, if specified, will be assigned to property `key` in the
 *   configuration.
 *
 * @returns {*} Either the InboxAPI instance, the HTTP configuration, or the value of a key in
 *   the HTTP configuration.
 */
InboxAPI.prototype.http = function(key, value) {
  if (!this._.http || typeof this._.http !== 'object') {
    this._.http = Merge({}, DEFAULT_HTTP);
  }

  if (!arguments.length) {
    return this._.http;
  } else if (arguments.length === 1) {
    return this._.http[key];
  } else if (arguments.length > 1) {
    this._.http[key] = value;
  }
  return this;
};

/**
 * @method InboxAPI#withCredentials
 *
 * Convenience method for querying InboxAPI#http('withCredentials'), returning either the current
 * value of `withCredentials`, or specifying a new value.
 *
 * @param {boolean=} value Boolean value to assign to the withCredentials configuration.
 *
 * @returns {*} Either the InboxAPI instance, or the value of `withCredentials` in the HTTP
 *   configuration.
 */
InboxAPI.prototype.withCredentials = function(value) {
  if (!arguments.length) {
    return !!this.http('withCredentials');
  } else {
    return this.http('withCredentials', !!value);
  }
};

var HEADER_REGEXP = /^[a-z0-9_-]+$/;

/**
 * @method InboxAPI#setRequestHeader
 *
 * Convenience method for specifying request headers to be issued by HTTP requests to the web
 * service. Primarily useful for certain authentication strategies.
 *
 * @param {string} header The header name to query. This value should be a string, and will be
 *   converted to lower-case. Non-lower-cased header names should not be specified manually.
 *
 * @param {*} value The value to assign to a header. If the value is a function, it will be
 *   invoked during a request, and the return value will be used as the header value.
 *
 * @returns {InboxAPI} The InboxAPI instance.
 *
 * @throws {TypeError} setRequestHeader will throw if either a header name is bad (not made up of
 *   ASCII letters, numbers, underscores and hyphens exclusively) or if there are fewer than two
 *   arguments passed into the function.
 */
InboxAPI.prototype.setRequestHeader = function(header, value) {
  if (arguments.length < 2) {
    throw new TypeError('Cannot invoke `setRequestHeader` on `InboxAPI`: header name and value ' +
      'are required.');
  }

  var http = this.http();
  if (!http.headers || typeof http.headers !== 'object') {
    http.headers = {};
  }

  header = ('' + header).toLowerCase();
  if (!HEADER_REGEXP.test(header)) {
    throw new TypeError('Cannot invoke `setRequestHeader` on `InboxAPI`: Bad header name "' +
      header + '".');
  }

  http.headers[header] = value;

  return this;
};

/**
 * PRIVATE API InboxAPI#forEachRequestHeader
 *
 * Convenience method for iterating over each request header and calling a function with the
 * header name and value. Only header names which are considered to be appropriate will be
 * used, and if they happen to be functions, the return value of the function is used rather than
 * the function itself.
 *
 * param {Function} fn The callback to be called for each iterated header and value.
 *
 * param {Object|Function} thisArg Value to use as `this` when invoking the callback.
 *
 * returns {InboxAPI} The InboxAPI instance.
 */
InboxAPI.prototype.forEachRequestHeader = function(fn, thisArg) {
  if (!thisArg || typeof thisArg !== 'object' && typeof thisArg !== 'function') {
    thisArg = null;
  }

  var headers = this.http('headers');
  var key;
  var value;
  if (!headers || typeof headers !== 'object') {
    return;
  }

  for (key in headers) {
    if (Object.prototype.hasOwnProperty.call(headers, key) && HEADER_REGEXP.test(key)) {
      value = headers[key];
      if (typeof value === 'function') {
        value = value();
      }

      fn.call(thisArg, key, value);
    }
  }

  return this;
};
