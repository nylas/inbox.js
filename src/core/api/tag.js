/**
 * @method InboxNamespace#tags
 *
 * Query for namespaces associated with the signed in Inbox account.
 *
 * @param {Array} optionalTags An array of InboxTag objects to be updated with new data.
 *   Specifying this parameter with a non-null value will remove items not found in the response from
 *   the server, and will add new properties to the found items, and add new items from the response
 *   which were not available previously.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 */
InboxNamespace.prototype.tags = function(optionalTags) {
  var self = this;
  var _ = self._;
  var inbox = _.inbox;
  var url;
  var updateTags = null;

  if (optionalTags) {
    if (IsArray(optionalTags)) {
      updateTags = optionalTags;
    }
  }

  url = URLFormat("%@/tags", _.namespaceUrl);

  return XHR(inbox, 'get', url, function(response) {
    // :::json
    // [
    //   <namespace_object>,
    //   <namespace_object>,
    //   <namespace_object>,
    //   ...
    // ]
    if (updateTags) {
      return MergeArray(updateTags, response, 'id', function(data) {
        return new InboxTag(self, data);
      });
    } else {
      var tags = new Array(response.length);
      var i, n = response.length;
      for (i = 0; i < n; ++i) {
        tags[i] = new InboxTag(self, response[i]);
      }
      return tags;
    }
  });
};

/**
 * @class InboxTag
 *
 * Class which represents a specific Tag identifier belonging to a specific Namespace.
 *
 * @param {InboxNamespace} namespace The InboxNamespace object which this InboxTag is to be
 *    associated with.
 *
 * @param {Object} data The data associated with a given InboxTag. This data arrives from a
 *   successful response from a server, and should always contain the expected properties. However,
 *   it is necessary for the object to contain a property `id` or `namespace`.
 *
 * @throws {TypeError} The InboxTag constructor will throw under the circumstances that we have
 *   no `id` property in the response, or if the response object is null or undefined,
 *   or if the `namespace` parameter is not an instance of InboxNamespace.
 */
function InboxTag(namespace, data) {
  if (!(namespace instanceof InboxNamespace)) {
    throw new TypeError("Cannot construct 'InboxTag': `namespace` parameter must be " +
                        "InboxNamespace");
  }

  if (!data || typeof data !== "object") {
    throw new TypeError("Cannot construct 'InboxTag': `data` does is not an object.");
  }

  if (!data.id) {
    throw new TypeError("Cannot construct 'InboxTag': `data` does not contain `id` or " +
                        "`name` keys");
  }

  if (!(this instanceof InboxTag)) {
    return new InboxTag(namespace, data);
  }

  this._ = {
    inbox: namespace._.inbox,
    namespace: namespace,
    tagId: data.id,
    tagName: data.name
  };

  if (data && typeof data === 'object') {
    Merge(this, data);
  }

  DefineProperty(this, '_', INVISIBLE);
}

/**
 * @method InboxTag#threads
 *
 * Query for threads associated with a particular tag.
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
InboxTag.prototype.threads = function(optionalThreadsOrFilters, filters) {
  var threads = optionalThreadsOrFilters;
  var _ = this._;
  if (threads && typeof threads === 'object' && !IsArray(threads)) {
    filters = threads;
    threads = null;
  }
  if (typeof filters !== 'object') {
    filters = {};
  }
  filters = Merge(Merge({}, filters || {}), {
    tag: _.tagId
  });

  return _.namespace.threads(threads, filters);
};
