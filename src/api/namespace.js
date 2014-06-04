// TODO: support caching.
InboxAPI.prototype.namespace(namespaceId) {
  var self = this;
  var _ = self._;

  if (typeof namespaceId !== 'string') {
    throw new TypeError("Unable to perform 'namespace()' on InboxAPI: " +
                        "namespaceId must be a string");
  }

  return _.promise(function(resolve, reject) {
    var xhr = XHRForMethod('get');

    AddListeners(xhr, {
      'load': function(event) {
        var response = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new InboxNamespace(self, ParseJSON(response)));
      },
      // TODO: retry count depending on status?
      'error': reject,

      'abort': reject
      // TODO: timeout/progress events are useful.
    });

    // TODO: headers / withCredentials
    XHRMaybeJSON(xhr);
    xhr.open(url, 'get');
    xhr.send(null);
  });
}

function InboxNamespace(inbox, data) {
  if (!(inbox instanceof InboxAPI)) {
    throw new TypeError("Cannot construct 'InboxNamespace': `inbox` parameter must be InboxAPI");
  }

  if (!(this instanceof InboxNamespace)) {
    return new InboxNamespace(inbox, data);    
  }

  this._ = {
    inbox: inbox
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}
