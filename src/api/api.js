function NativePromiseWrapper(resolve, reject) {
  return new window.Promise(resolve, reject);
}

function InboxAPI(optionsOrAPIUrl, optionalPromiseConstructor) {
  var options;

  if (typeof optionsOrAPIUrl === 'object') {
    options = optionsOrAPIUrl;
  } else {
    options = {
      url: optionsOrAPIUrl,
      promise: optionsOrPromiseConstructor || window.Promise
    };
  }

  if (options.promise == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `promise`, " +
                        "or no native Promise available");    
  } else if (typeof options.promise !== 'function') {
    throw new TypeError("Unable to construct 'InboxAPI': option `promise` must be a " +
                        "function which returns an ECMAScript6-compatible Promise");
  }

  if (typeof options.url == null) {
    throw new TypeError("Unable to construct 'InboxAPI': missing option `url`");
  } else if (typeof options.url !== 'string') {
    throw new TypeError("Unable to construct 'InboxAPI': option `url` must be a string");
  }

  if (options.promise === window.Promise) {
    options.promise = NativePromiseWrapper;
  }

  if (!(this instanceof Inbox)) {
    return new Inbox(options);
  }

  options._cache = {};

  this._ = options;

  if (Object.defineProperty) {
    Object.defineProperty(this, '_', {
      enumerable: false,
      writable: false,
      configurable: false
    });
  }
}
