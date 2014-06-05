// TODO: support caching.
InboxAPI.prototype.namespace = function(namespaceId) {
  var self = this;
  var _ = self._;
  var url;

  if (namespaceId == null) {
    throw new TypeError("Unable to perform 'namespace()' on InboxAPI: " +
                        "missing option `namespaceId`");
  } else if (typeof namespaceId !== 'string') {
    throw new TypeError("Unable to perform 'namespace()' on InboxAPI: " +
                        "namespaceId must be a string");
  }

  url = URLAddPaths(_.url, namespaceId);

  return _.promise(function(resolve, reject) {
    var xhr = XHRForMethod('get');

    AddListeners(xhr, {
      'load': function(event) {
        var response = ParseJSON('response' in xhr ? xhr.response : xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new InboxNamespace(self, response));
        } else {
          reject(XHRData(xhr, response));
        }
      },
      // TODO: retry count depending on status?
      'error': RejectXHR(reject, xhr, 'json'),

      'abort': RejectXHR(reject, xhr, 'json')
      // TODO: timeout/progress events are useful.
    });

    // TODO: headers / withCredentials
    XHRMaybeJSON(xhr);
    xhr.open('get', url);
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
    inbox: inbox,
    url: URLAddPaths(inbox._.url, data.id || data.namespace)
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}
