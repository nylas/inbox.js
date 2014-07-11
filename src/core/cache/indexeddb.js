var HAVE_INDEXEDDB = window.indexedDB &&
                     typeof window.indexedDB === 'object' &&
                     typeof window.indexedDB.open === 'function';

var IndexedDBCache = HAVE_INDEXEDDB &&
    function IndexedDBCache(token) {
  InboxCache.call(this, token);
  var self = this;

  var req = window.indexedDB.open('inbox@' + token);
  req.onupgradeneeded = function() {
    var db = req.result;
    DefineReadOnly(self, 'db', db, INVISIBLE);

    db.createObjectStore("namespaces", {
      keyPath: "_.namespaceId"
    });

    db.createObjectStore("threads", {
      keyPath: "_.threadId"
    });

    db.createObjectStore("messages", {
      keyPath: "_.messageId"
    });

    self.setStatus('ready');
  };

  req.onsuccess = function() {
    DefineReadOnly(self, 'db', req.result, INVISIBLE);
    self.setStatus('ready');
  };

  req.onerror = function() {
    self.setStatus('error');
  };
};

function IndexedDBCacheGetAll(db, objectStore, mode, fn) {
  var transaction = db.transaction(objectStore, mode);
  var store = transaction.objectStore(objectStore);
  var request = store.openCursor();
  var array = null;
  request.onsuccess = function() {
    var cursor = request.result;
    if (cursor) {
      array = array || [];
      array.push(cursor.value);
      cursor.continue();
    } else {
      fn(array);
    }
  };

  request.onabort = function() {
    // TODO(@caitp): log an error here...
    fn(null);
  };
}

function IndexedDBCachePutAll(db, objectStore, objects, fn) {
  if (!IsArray(objects)) {
    throw new TypeError('Cannot invoke `IndexedDBCachePutAll`: objects must be an Array');
  }
  var transaction = db.transaction(objectStore, 'readwrite');
  var store = transaction.objectStore(objectStore);
  var i = 0;
  var ii = objects.length;
  var request = store.put(objects[i++]);

  request.onsuccess = success;
  transaction.oncomplete = complete;

  function success(event) {
    if (i < ii) {
      request = store.put(objects[i++]);
      request.onsuccess = success;
    }
  }

  function complete(event) {
    fn(objects);
  }
}

function IndexedDBCachePut(db, objectStore, object, fn) {
  var transaction = db.transaction(objectStore, 'readwrite');
  var store = transaction.objectStore(objectStore);

  transaction.onsuccess = function() {
    fn(object);
  };

  transaction.onerror = function() {
    fn(null);
  };

  store.put(object);
}

if (IndexedDBCache) {
  IndexedDBCache.prototype = Object.create(InboxCache.prototype);
  Object.defineProperty(IndexedDBCache.prototype, 'constructor', {
    enumerable: false,
    value: IndexedDBCache
  });

  IndexedDBCache.prototype.get = function(type, fn) {
    if (!this.db) return fn(null);
    IndexedDBCacheGetAll(this.db, type, "readonly", fn);
  };

  IndexedDBCache.prototype.put = function(type, data, fn) {
    if (!this.db) return fn(null);
    if (IsArray(data)) {
      IndexedDBCachePutAll(this.db, type, data, fn);
    } else {
      IndexedDBCachePut(this.db, type, data, fn);
    }
  };

  RegisterCacheImplementation('indexeddb', IndexedDBCache);
  DEFAULT_CACHE = IndexedDBCache;
}
