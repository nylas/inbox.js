var ERROR = {};

function NativePromiseWrapper(resolve, reject) {
  return new window.Promise(resolve, reject);
}

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
