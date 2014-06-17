// TODO: Support filtering threads
InboxNamespace.prototype.threads = function() {
  var self = this;
  var _ = self._;
  var url;

  url = URLFormat("%@/threads", _.namespaceUrl);

  return _.inbox._.promise(function(resolve, reject) {
    var xhr = XHRForMethod('get');

    AddListeners(xhr, {
      'load': function(event) {
        var response = ParseJSON('response' in xhr ? xhr.response : xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          // :::json
          // [
          //   <thread_object>,
          //   <thread_object>,
          //   <thread_object>,
          //   ...
          // ]
          var threads = new Array(response.length);
          var i, n = response.length;
          for (i = 0; i < n; ++i) {
            threads[i] = new InboxThread(self, response[i]);
          }
          resolve(threads);
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

  return _.inbox._.promise(function(resolve, reject) {
    var xhr = XHRForMethod('get');

    AddListeners(xhr, {
      'load': function(event) {
        var response = ParseJSON('response' in xhr ? xhr.response : xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new InboxThread(self, response));
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
