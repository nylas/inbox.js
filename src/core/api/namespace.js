// TODO: support caching.
InboxAPI.prototype.namespaces = function() {
  var self = this;
  var _ = self._;
  var url;

  url = URLFormat("%@/n", _.baseUrl);

  return XHR(self, 'get', url, function(response) {
    // :::json
    // [
    //   <namespace_object>,
    //   <namespace_object>,
    //   <namespace_object>,
    //   ...
    // ]
    var namespaces = new Array(response.length);
    var i, n = response.length;
    for (i = 0; i < n; ++i) {
      namespaces[i] = new InboxNamespace(self, response[i]);
    }
    return namespaces;
  });
};

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

  url = URLFormat("%@/n/%@", _.baseUrl, namespaceId);

  return XHR(self, 'get', url, function(response) {
    return new InboxNamespace(self, response);
  });
};

function InboxNamespace(inbox, data) {
  if (!(inbox instanceof InboxAPI)) {
    throw new TypeError("Cannot construct 'InboxNamespace': `inbox` parameter must be InboxAPI");
  }

  if (!data || typeof data !== "object") {
    throw new TypeError("Cannot construct 'InboxNamespace': `data` does is not an object.");
  }

  if (!data.id && !data.namespace) {
    throw new TypeError("Cannot construct 'InboxNamespace': `data` does not contain `id` or " +
                        "`namespace` keys");
  }

  if (!(this instanceof InboxNamespace)) {
    return new InboxNamespace(inbox, data);
  }

  this._ = {
    inbox: inbox,
    namespaceId: data.id || data.namespace,
    namespaceUrl: URLFormat('%@/n/%@', inbox._.baseUrl, data.id || data.namespace)
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}

InboxNamespace.prototype.threads = function(options) {
  
};
