InboxNamespace.prototype.threads = function(optionalThreadsOrFilters, filters) {
  var self = this;
  var _ = self._;
  var url;
  var updateThreads = null;
  if (typeof optionalThreadsOrFilters === 'object') {
    if (IsArray(optionalThreadsOrFilters)) {
      updateThreads = optionalThreadsOrFilters;
    } else {
      filters = optionalThreadsOrFilters;
    }
  }

  url = URLFormat("%@/threads%@", _.namespaceUrl, InboxURLFilters(filters));

  return XHR(_.inbox, 'get', url, function(response) {
    // :::json
    // [
    //   <thread_object>,
    //   <thread_object>,
    //   <thread_object>,
    //   ...
    // ]
    if (updateThreads) {
      return MergeArray(updateThreads, response, 'id', function(data) {
        return new InboxThread(self, data);
      });
    } else {
      var threads = new Array(response.length);
      var i, n = response.length;
      for (i = 0; i < n; ++i) {
        threads[i] = new InboxThread(self, response[i]);
      }
      return threads;
    }
  });
};

InboxNamespace.prototype.thread = function(threadId) {
  var self = this;
  var _ = self._;
  var url;

  if (threadId == null) {
    throw new TypeError("Unable to perform 'thread()' on InboxNamespace: " +
                        "missing option `threadId`");
  } else if (typeof threadId !== 'string') {
    throw new TypeError("Unable to perform 'thread()' on InboxNamespace: " +
                        "threadId must be a string");
  }

  url = URLFormat("%@/%@", _.namespaceUrl, threadId);

  return XHR(_.inbox, 'get', url, function(response) {
    return new InboxThread(self, response);
  });
};

function InboxThread(namespace, data) {
  if (!(namespace instanceof InboxNamespace)) {
    throw new TypeError("Cannot construct 'InboxThread': `inbox` parameter must be InboxNamespace");
  }

  if (!data || typeof data !== "object") {
    throw new TypeError("Cannot construct 'InboxThread': `data` does is not an object.");
  }

  if (!data.id) {
    throw new TypeError("Cannot construct 'InboxThread': `data` does not contain `id` key");
  }

  if (!(this instanceof InboxThread)) {
    return new InboxThread(namespace, data);
  }

  this._ = {
    inbox: namespace._.inbox,
    namespace: namespace,
    threadId: data.id,
    threadUrl: URLFormat('%@/threads/%@', namespace._.namespaceUrl, data.id)
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}

// TODO(@caitp): is `sync` a good name for this method? Do not want to confuse this with the
// inboxapp concept of `sync`.
InboxThread.prototype.sync = function() {
  var self = this;
  var _ = self._;
  var inbox = _.inbox;
  return XHR(_.inbox, 'get', _.threadUrl, function(response) {
    InboxThreadSchema.merge(self, response);
    return self;
  });
};
