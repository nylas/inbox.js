function InboxCache(token) {
  DefineReadOnly(this, 'token', token, INVISIBLE);
  DefineReadOnly(this, '__statusChangedListeners', [], INVISIBLE);
  if (this.constructor === InboxCache) {
    // If stub cache, notify ready immediately.
    this.setStatus('ready');
  }
}

var cacheImplementations = {
  'none': InboxCache
};

function GetCacheImplementation(name) {
  return cacheImplementations[name.toLowerCase()];
}

function RegisterCacheImplementation(name, constructor) {
  if (typeof name !== 'string') {
    throw new TypeError('Cannot invoke `registerCacheImplementation`: name must be a string');
  }
  if (typeof constructor !== 'function') {
    throw new TypeError('Cannot invoke `registerCacheImplementation`: constructor must be a ' +
                        'function');
  }
  cacheImplementations[name.toLowerCase()] = constructor;
}

DefineReadOnly(InboxCache, 'registerCacheImplementation', RegisterCacheImplementation);

InboxCache.prototype.onStatusChanged = function(fn) {
  this.__statusChangedListeners.push(fn);
  return this;
};

InboxCache.prototype.setStatus = function(status) {
  ForEach(this.__statusChangedListeners, function(fn) {
    fn(status);
  });
};

var DEFAULT_CACHE;
var CACHE_METHODS = {
  get: {
    'namespaces': 1,
    'threads': 1,
    'messages': 1,
  },

  put: {
    'namespaces': 2,
    'threads': 2,
    'messages': 2
  }
};

function GetFromCache(cache, type) {
  var fn = cache.get;
  var args = Array.prototype.slice.call(arguments, 1);
  var cb = args[CACHE_METHODS.get[type] >>> 0];
  if (typeof fn === 'function') {
    fn.apply(cache, args);
  } else {
    cb(null);
  }
}

function PutInCache(cache, type) {
  var fn = cache.put;
  var args = Array.prototype.slice.call(arguments, 1);
  var cb = args[CACHE_METHODS.put[type] >>> 0];
  if (typeof fn === 'function') {
    fn.apply(cache, args);
  } else if (typeof cb === 'function') {
    cb(null);
  }
}
