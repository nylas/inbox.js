/**
 * @class INCache
 *
 * @description
 * Abstract class responsible for caching data on the client. This class is exposed to applications
 * via InboxAPI#Cache.
 *
 * @param {InboxAPI} inbox The InboxAPI instance which owns this cache.
 * @param {name} name An extra property which may be used by child classes in order to manage multiple
 *   caches. Typically should be associated with a single Inbox account.
 */
function INCache(inbox, name) {
  defineProperty(this, '_', INVISIBLE, null, null, {
    inbox: inbox,
    cacheName: name || 'inbox.js'
  });
}


/**
 * @method
 * @name INCache#get
 *
 * @description
 * Get an object represented by an `id` from the cache. The object may be of any type, so long as the
 * id matches. This method is assumed to be asynchronous.
 *
 * When subclassing INCache, if no error has occurred, the callback should pass a `null` value for the
 * error parameter. Similarly, if a cached item is not found, the callback should pass either a `null`
 * or `undefined` value for the value parameter.
 *
 * @param {string} id The id of the object to be returned.
 * @param {function(error, object)} callback Callback to be called when the asynchronous operation
 *   is complete. The callback expects two parameters --- the first is an error, in case a problem
 *   occurred. The second is the cached value.
 */
INCache.prototype.get = function(id, callback) {
  var name = this.cacheType || this.constructor.name || 'Cache';
  throw new Error(formatString('cannot invoke %@#get(): %@#get() is not implemented.',
    name, name));
};


/**
 * @method
 * @name INCache#getByType
 *
 * @description
 * Get a collection of objects of a given type from the cache. This method is assumed to be
 * asynchronous.
 *
 * When subclassing INCache, if no error has occurred, the callback should pass a `null` value for the
 * error parameter. Similarly, if a cached item is not found, the callback should pass either a `null`
 * or `undefined` value for the values parameter.
 *
 * @param {string} type The lower-cased object type to collect. Should correspond with the `object`
 *   property values found in responses from the Inbox API.
 * @param {function(error, values)} callback Callback to be called when the asynchronous operation
 *   is complete. The callback expects two parameters --- the first is an error, in case a problem
 *   occurred. The second is an array of the cached values, if found.
 */
INCache.prototype.getByType = function(type, callback) {
  var name = this.cacheType || this.constructor.name || 'Cache';
  throw new Error(formatString('cannot invoke %@#getByType(): %@#getByType() is not implemented.',
    name, name));
};


/**
 * @method
 * @name INCache#persist
 *
 * @description
 * Persist a single item in the cache. The item is an object, and is associated with an id. This
 * method is assumed to be asynchronous.
 *
 * When subclassing INCache, if no error has occurred, the callback should pass a `null` value for the
 * error parameter. Similarly, if a cached item is not found, the callback should pass either a `null`
 * or `undefined` value for the values parameter.
 *
 * @param {string} id The primary key to associate the object with.
 * @param {object} object The object to be cached.
 * @param {function(error, values)} callback Callback to be called when the asynchronous operation
 *   is complete. The first parameter is an error, if an error has occurred. The second parameter may
 *   be the cached values, but may be safely ignored.
 */
INCache.prototype.persist = function(id, object, callback) {
  var name = this.cacheType || this.constructor.name || 'Cache';
  throw new Error(formatString('cannot invoke %@#persist(): %@#persist() is not implemented.',
    name, name));
};


/**
 * @method
 * @name INCache#remove
 *
 * @description
 * Remove a single item from the cache. This method is assumed to be asynchronous.
 *
 * When subclassing INCache, if no error has occurred, the callback should pass a `null` value for
 * the error parameter. If a value is successfully removed, the original cached value should be
 * passed as the second parameter to the callback.
 *
 * @param {string} id The primary key to be removed from the cache.
 * @param {function(error, values)} callback Callback to be called when the asynchronous operation
 *   is complete. The first parameter is an error, if an error has occurred. The second parameter
 *   should contain the cached value which was removed.
 */
INCache.prototype.remove = function(id, callback) {
  var name = this.cacheType || this.constructor.name || 'Cache';
  throw new Error(formatString('cannot invoke %@#remove(): %@#remove() is not implemented.',
    name, name));
};

var caches = {};


/**
 * @function
 * @name INCache.register
 *
 * @description
 * Register a custom cache type with the system, enabling the use of user-defined cache strategies.
 *
 * The call to register() should occur before any subclassed methods are defined in the prototype,
 * because the process of implicitly extending INCache will overwrite the prototype of the child
 * class.
 *
 * @param {string} name The registered name of the cache class. This is the name used to find the
 *   cache class in the map of registered cache classes when InboxAPI is configured with
 *   `cache: <string>`. Cache class-names are case-insensitive.
 * @param {function(InboxAPI, name)} The constructor to register. The constructor will implicitly
 *   extend INCache if it does not already.
 */
defineProperty(INCache, 'register', 0, null, null, function(name, constructor) {
  if (typeof constructor !== 'function') {
    throw new TypeError('Cannot invoke `INCache#register()`: constructor is not a function.');
  }

  if (!(constructor instanceof INCache)) {
    inherits(constructor, INCache);
  }

  if (!hasProperty(constructor.prototype, 'cacheType')) {
    defineProperty(constructor.prototype, 'cacheType', INVISIBLE, null, null, name);
  } else {
    try {
      defineProperty(constructor.prototype, 'cacheType', INVISIBLE, null, null,
        '' + constructor.prototype.cacheType);
    } catch (e) {}
  }
  name = ('' + name).toLowerCase();
  caches[name] = constructor;
});

defineProperty(INCache, 'unregister', 0, null, null, function(name) {
  name = ('' + name).toLowercase();
  if (hasProperty(caches, name)) {
    delete caches[name];
  }
});


/**
 * @function getCacheType
 * @private
 *
 * @description
 * Translate a string, constructor, or object into a cacheType.
 *
 * @param {string|function|object} cache the cache to get the cacheType from
 *
 * @returns {string} the cacheType of the object
 */
function getCacheType(cache) {
  var type;
  if (typeof cache === 'function' && cache.prototype) {
    type = cache.prototype.cacheType;
  } else if (typeof cache === 'object' && cache) {
    type = cache.cacheType;
  } else if (typeof cache === 'string') {
    type = cache;
  }

  if (typeof type === 'string' && type) {
    return type.toLowerCase();
  }

  return undefined;
}


/**
 * @function INCache.isRegistered
 *
 * description
 * A simple helper to determine if a given cache is registered. This method only checks if a
 * name or constructor is registered, and will not check if a specific cache instance is
 * registered.
 *
 * @param {function|string} cacheOrName Either the constructor of a given cache, or the name for
 *   which the cache may be registered as.
 * @returns {boolean} Returns true if the cache is determined to be registered, and returns false
 *   if the cache is not in the map of registered caches, or if the type is not appropriate.
 */
defineProperty(INCache, 'isRegistered', 0, null, null, function(cacheOrName) {
  return hasProperty(caches, getCacheType(cacheOrName));
});


/**
 * @function getCacheByName
 * @private
 *
 * @description
 * Return the registered cache constructor for the given cache name, or undefined
 *
 * @param {string} cacheName the name of the cache
 *
 * @returns {function} the registered cache constructor for the given cache name, or undefined
 */
function getCacheByName(cacheName) {
  if (typeof cacheName === 'string' && cacheName) {
    return caches[cacheName.toLowerCase()];
  }
}


/**
 * @function
 * @name persistModel
 *
 * @description
 * Private helper for persisting INModelObjects in the cache.
 *
 * @param {INModelObject} The model object to cache.
 */
function persistModel(obj) {
  if (obj instanceof INModelObject) {
    var inbox = obj.inbox();
    if (inbox) {
      inbox._.cache.persist(obj.id, obj.raw(), noop);
    }
  }
}


/**
 * @function
 * @name deleteModel
 *
 * @description
 * Private helper for deleting INModelObjects from the cache.
 *
 * @param {INModelObject} obj The model object to be deleted from the cache.
 */
function deleteModel(obj) {
  if (obj instanceof INModelObject) {
    var inbox = obj.inbox();
    if (inbox) {
      inbox._.cache.remove(obj.id, noop);
    }
  }
}
