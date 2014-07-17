function INStubCache(inbox) {
  INCache.call(this, inbox);
}

INCache.register('stub', INStubCache);

INStubCache.prototype.get = function(id, callback) {
  callback(null, null);
};

INStubCache.prototype.getByType = function(type, callback) {
  callback(null, null);
};

INStubCache.prototype.persist = function(id, object, callback) {
  callback(null, null);
};

INStubCache.prototype.remove = function(id, callback) {
  callback(null, null);
};
