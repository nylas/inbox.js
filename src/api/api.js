function NativePromiseWrapper(resolve, reject) {
  return new window.Promise(resolve, reject);
}

function InboxAPI(optionsOrAPIUrl, optionalPromiseConstructor) {
  var options;

  if (optionsOrAPIUrl && typeof optionsOrAPIUrl === 'object') {
    options = optionsOrAPIUrl;
  } else {
    options = {
      url: optionsOrAPIUrl,
      promise: optionalPromiseConstructor || window.Promise
    };
  }

  if (options.url == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `url`");
  } else if (typeof options.url !== 'string') {
    throw new TypeError("Unable to construct 'InboxAPI': option `url` must be a string");
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
