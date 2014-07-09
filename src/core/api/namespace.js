/**
 * @method InboxAPI#namespaces
 *
 * Query for namespaces associated with the signed in Inbox account.
 *
 * @param {Array} optionalNamespaces An array of InboxNamespace objects to be updated with new data.
 *   Specifying this parameter with a non-null value will remove items not found in the response from
 *   the server, and will add new properties to the found items, and add new items from the response
 *   which were not available previously.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 */
InboxAPI.prototype.namespaces = function(optionalNamespaces) {
  var self = this;
  var _ = self._;
  var url;
  var updateNamespaces = null;

  if (optionalNamespaces) {
    if (IsArray(optionalNamespaces)) {
      updateNamespaces = optionalNamespaces;
    }
  }

  url = URLFormat("%@/n", _.baseUrl);

  return XHR(self, 'get', url, function(response) {
    // :::json
    // [
    //   <namespace_object>,
    //   <namespace_object>,
    //   <namespace_object>,
    //   ...
    // ]
    if (updateNamespaces) {
      _.cache.PutInCache(_.cache, 'namespaces',
        MergeArray(updateNamespaces, response, 'id', function(data) {
          return new InboxNamespace(self, data);
        }), Noop);
      return updateNamespaces;
    } else {
      var namespaces = new Array(response.length);
      var i, n = response.length;
      for (i = 0; i < n; ++i) {
        namespaces[i] = new InboxNamespace(self, response[i]);
      }
      PutInCache(_.cache, 'namespaces', namespaces, Noop);
      return namespaces;
    }
  }, 'namespaces');
};

/**
 * @method InboxAPI#namespace
 *
 * Query for a specific namespace (by ID)
 *
 * @param {string} namespaceId The base36 namespace identifier associated with the account.
 *
 * @returns {Promise} A Promise to be fulfilled or rejected with the processed response from the
 *   server.
 *
 * @throws {TypeError} Thrown if no namespaceId is provided, or if namespaceId is not a string.
 */
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

/**
 * @class InboxNamespace
 *
 * Class which represents a specific Namespace or email address on the Inbox web service
 *
 * @param {InboxAPI} inbox The InboxAPI object which this InboxNamespace is to be associated with.
 *
 * @param {Object} data The data associated with a given InboxNamespace. This data arrives from a
 *   successful response from a server, and should always contain the expected properties. However,
 *   it is necessary for the object to contain a property `id` or `namespace`.
 *
 * @throws {TypeError} The InboxNamespace constructor will throw under the circumstances that we have
 *   no `id` or `namespace` properties in the response, or if the response object is null or undefined,
 *   or if the `inbox` parameter is not an instance of InboxAPI.
 */
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
