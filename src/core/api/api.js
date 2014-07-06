var ERROR = {};

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

  this._ = options;
  DefineProperty(this, '_', INVISIBLE);
}
