function NativePromiseWrapper(resolve, reject) {
  return new window.Promise(resolve, reject);
}

function InboxAPI(optionsOrBaseUrl, optionalPromiseConstructor) {
  var options;

  if (optionsOrBaseUrl && typeof optionsOrBaseUrl === 'object') {
    options = optionsOrBaseUrl;
  } else {
    options = {
      baseUrl: optionsOrBaseUrl,
      promise: optionalPromiseConstructor || window.Promise
    };
  }

  if (options.baseUrl == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `baseUrl`");
  } else if (typeof options.baseUrl !== 'string') {
    throw new TypeError("Unable to construct 'InboxAPI': option `baseUrl` must be a string");
  }

  if (options.promise == null) {
    options.promise = window.Promise;
  }

  if (options.promise == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `promise`, " +
                        "or no native Promise available");
  }
  if (typeof options.promise !== 'function') {
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
