InboxAPI.prototype.namespace(namespaceId) {
  var self = this._;

  if (typeof namespaceId !== 'string') {
    throw new TypeError("Unable to perform 'namespace()' on InboxAPI: " +
                        "namespaceId must be a string");
  }

  return self._.promise(function(resolve, reject) {
    var xhr = XHRForMethod('get');

    
  });
}
