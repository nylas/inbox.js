/**
 * @method InboxNamespace#threads
 *
 * Query for threads associated with a particular namespace or email address.
 *
 * @param {Array|Object} optionalThreadsOrFilters If specified, and this object is an Array, it is
 *   treated as an array of InboxThreads to update. Otherwise, if it is an Object, it is treated
 *   as the filters parameter.
 *
 * @param {Object} filters An optional set of filters to be applied from the server, and narrow the
 *   results of the operation.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 */
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

/**
 * @method InboxNamespace#thread
 *
 * Query for threads associated with a particular namespace or email address.
 *
 * @param {string} threadId The base-36 thread ID to query for.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 *
 * @throws {TypeError} This method will throw if `threadId` is not specified, or is not a string.
 */
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

/**
 * @class InboxThread
 *
 * Class which represents a specific Thread associated with a Namespace or Email address.
 *
 * @param {InboxNamespace} namespace The InboxNamespace object which this InboxThread is to be
 *   associated with.
 *
 * @param {Object} data The data associated with a given InboxThread. This data arrives from a
 *   successful response from a server, and should always contain the expected properties. However,
 *   it is necessary for the object to contain a property `id`.
 *
 * @throws {TypeError} The InboxThread constructor will throw under the circumstances that we have
 *   no `id` property in the response, or if the response object is null or undefined,
 *   or if the `namespace` parameter is not an instance of InboxNamespace.
 */
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


/**
 * @method InboxThread#sync
 *
 * Update a thread with new data from the server.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server. If the promise is fulfilled, the object will have the same identity as the original
 *   InboxThread object, but will be merged with properties associated with InboxThread.
 */
InboxThread.prototype.sync = function() {
  // TODO(@caitp): is `sync` a good name for this method? Do not want to confuse this with the
  // inboxapp concept of `sync`.
  var self = this;
  var _ = self._;
  var inbox = _.inbox;
  return XHR(_.inbox, 'get', _.threadUrl, function(response) {
    InboxThreadSchema.merge(self, response);
    return self;
  });
};

/**
 * @method InboxThread#getMessages
 *
 * Query for messages associated with the current Thread, optionally updating an array of existing
 &   InboxMessages, and optionally filtered.
 *
 * @param {Array|Object} optionalMessagesOrFilters If specified, and this object is an Array, it is
 *   treated as an array of InboxMessages to update. Otherwise, if it is an Object, it is treated
 *   as the filters parameter.
 *
 * @param {Object} filters An optional set of filters to be applied from the server, and narrow the
 *   results of the operation.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 */
InboxThread.prototype.getMessages = function(optionalMessagesOrFilters, filters) {
  // TODO(@caitp): rename this method --- This name is in use because `messages` shadows another
  // property of the response, however we should do better.
  var url;
  var self = this;
  var namespace = self._.namespace;

  if (!IsArray(optionalMessagesOrFilters)) {
    filters = optionalMessagesOrFilters;
    optionalMessagesOrFilters = null;
  }

  filters = (typeof filters === 'object' && filters) || {};
  filters.thread = this._.threadId;

  url = URLFormat('%@/messages%@', namespace._.namespaceUrl, InboxURLFilters(filters));
  return XHR(self._.inbox, 'get', url, function(response) {
    if (optionalMessagesOrFilters) {
      return MergeArray(optionalMessagesOrFilters, response, 'id', function(data) {
        return new InboxMessage(self, data);
      });
    } else {
      var messages = new Array(response.length);
      var i, n = response.length;
      for (i = 0; i < n; ++i) {
        messages[i] = new InboxMessage(self, response[i]);
      }
      return messages;
    }
  });
};
