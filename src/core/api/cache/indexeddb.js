var _indexedDB = window.indexedDB ||
                 window.mozIndexedDB ||
                 window.webkitIndexedDB ||
                 window.msIndexedDB;

var haveIndexedDB = !!(typeof _indexedDB === 'object' &&
                    typeof _indexedDB.open === 'function');

function INIDBCache(inbox, name) {
  if (!haveIndexedDB) {
    throw new TypeError('IndexedDB is not supported in this browser.');
  }
  INCache.call(this, inbox, name);  
}

if (haveIndexedDB) {
  INCache.register('indexeddb', INIDBCache);
}

function INIDBCacheDB(cache, callback) {
  if (cache._.opening) {
    cache.opening.push(callback);
  } else if (cache._.db) {
    callback(null, cache._.db);
  } else {
    cache._.opening = [];
    var req = _indexedDB.open(cache._.cacheName, 1);
    req.onerror = function(event) {
      callback(req.error, null);
    };

    req.onsuccess = function(event) {
      var db = event.target.result;

      defineProperty(cache._, 'db', INVISIBLE|WRITABLE, null, null, db);

      callback(null, db);
      while (cache._.opening.length) {
        cache.opening.shift()(null, db);
      }

      cache._.opening = false;
    };

    req.onupgradeneeded = function(event) {
      var db = event.target.result;

      var store = db.createObjectStore('resources', {
        keyPath: 'id'
      });

      store.createIndex('by_namespace', 'namespace');
      store.createIndex('by_object', 'object');

      defineProperty(cache._, 'db', INVISIBLE|WRITABLE, null, null, db);
      callback(null, db);
      while (cache._.opening.length) {
        cache.opening.shift()(null, db);
      }

      cache._.opening = false;
    };
  }
}

INIDBCache.prototype.get = function(id, callback) {
  INIDBCacheDB(this, function(err, db) {
    if (err) return callback(err, null);
    var transaction = db.transaction('resources');
    var store = transaction.objectStore('resources');
    var req = store.get(id);
    transaction.onsuccess = function() {
      callback(null, req.result);
    };

    transaction.onerror = function() {
      callback(req.error, null);
    };
  });
};

INIDBCache.prototype.getByType = function(type, callback) {
  INIDBCacheDB(this, function(err, db) {
    if (err) return callback(err, null);
    var transaction = db.transaction('resources');
    var store = transaction.objectStore('resources');
    var index = store.index('by_object');
    var req = index.openCursor(type);
    var array;

    req.onsuccess = function() {
      var cursor = req.result;

      if (cursor) {
        array = array || [];
        array.push(cursor.value);
        cursor.continue();
      } else {
        callback(null, array);
      }
    };

    req.onerror = function() {
      callback(req.error, null);
    };
  });
};

INIDBCache.prototype.persist = function(id, object, callback) {
  INIDBCacheDB(this, function(err, db) {
    if (err) return callback(err, null);
    var transaction = db.transaction('resources');
    var store = transaction.objectStore('resources', 'readwrite');
    var req = store.put(object, id);
    transaction.onsuccess = function() {
      callback(null, req.result);
    };

    transaction.onerror = function() {
      callback(req.error, null);
    };
  });
};

INIDBCache.prototype.remove = function(id, callback) {
  INIDBCacheDB(this, function(err, db) {
    if (err) return callback(err, null);
    var transaction = db.transaction('resources');
    var store = transaction.objectStore('resources', 'readwrite');
    var req = store.delete(id);
    transaction.onsuccess = function() {
      callback(null, req.result);
    };

    transaction.onerror = function() {
      callback(req.error, null);
    };
  });
};

