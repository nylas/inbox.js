/**
 * @class INNamespace
 * @constructor
 * @augments INModelObject
 *
 * @description
 * A namespace object, essentially representing an email address, and a facet of an Inbox account,
 * which can send and receive messages for the associated email address.
 */
function INNamespace(inbox, id) {
  INModelObject.call(this, inbox, id);
  this._.namespace = this;
  this.namespaceId = this.id;
}

inherits(INNamespace, INModelObject);


/**
 * @function
 * @name INNamespace#namespace
 *
 * @description
 * Overload of {INModelObject#namespace} which always returns the value 'this'. The overloaded
 * method is provided to avoid getting stuck in circular traversal.
 *
 * @returns {INNamespace} this
 */
INNamespace.prototype.namespace = function() {
  return this;
};

/**
 * @function
 * @name INNamespace#namespaceUrl
 *
 * @description
 * Overload of {INModelObject#namespace} which always returns the value 'this'. The overloaded
 * method is provided to avoid getting stuck in circular traversal.
 *
 * @returns {INNamespace} this
 */
INNamespace.prototype.namespaceUrl = function() {
  return this.resourceUrl();
};


/**
 * @function
 * @name INNamespace#resourceUrl
 *
 * @description
 * Returns the URL for the namespace
 *
 * @returns {string} the resource path of the file.
 */
INNamespace.prototype.resourceUrl = function() {
  if (this.isUnsynced())
    return null;
  return formatUrl('%@/%@/%@', this.baseUrl(), this.resourceName(), this.id);
};


/**
 * @function
 * @name INNamespace#resourceName
 *
 * @description
 * Returns the name of the resource used when constructing URLs
 *
 * @returns {string} the resource path of the file.
 */
INNamespace.resourceName = INNamespace.prototype.resourceName = function() {
  return 'n';
};


/**
 * @property
 * @name INNamespace#emailAddress
 *
 * The email address associated with this namespace. The raw value for this property is
 * 'email_address'.
 */


/**
 * @property
 * @name INNamespace#account
 *
 * An account ID, to which the namespace is associated.
 */


/**
 * @property
 * @name INNamespace#provider
 *
 * A string representing the Provider --- typically 'Gmail' or 'yahoo' or similar.
 */


/**
 * @property
 * @name INNamespace#status
 *
 * Unused, currently.
 */


/**
 * @property
 * @name INNamespace#scope
 *
 * Unused, currently.
 */


/**
 * @property
 * @name INNamespace#lastSync
 *
 * Unused, currently.
 */


/**
 * @property
 * @name INNamespace#object
 *
 * The resource type, always 'namespace'.
 */
defineResourceMapping(INNamespace, {
  'emailAddress': 'email_address',
  'account': 'account',
  'provider': 'provider',
  'status': 'status',
  'scope': 'scope',
  'lastSync': 'last_sync',
  'object': 'const:namespace'
});


/**
 * @function
 * @name INNamespace#threads
 *
 * @description
 * A method which fetches threads from the server, optionally updating an array of threads, and
 * optionally filtered. If either filters or optional threads are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INThread>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INThread objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated threads, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.threads = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INThread, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#thread
 *
 * @description
 * Fetch a thread by ID from either the cache or server. The resolved INThread object may be stale.
 *
 * TODO(@caitp): provide a way to determine whether the fetched resource is fresh or stae.
 *
 * @param {string} threadId the ID of the thread to fetch.
 *
 * @returns {Promise} a promise which is fulfilled with either a new INThread instance, or an error
 *   from the cache subsystem or server.
 */
INNamespace.prototype.thread = function(threadId) {
  var self = this;
  var inbox = this.inbox();
  var cache = inbox._.cache;
  if (!arguments.length) {
    throw new TypeError(
      'Unable to perform `thread()` on INNamespace: missing option `threadId`.');
  } else if (typeof threadId !== 'string') {
    throw new TypeError(
      'Unable to perform `thread()` on INNamespace: threadId must be a string.');
  }
  return this.promise(function(resolve, reject) {
    cache.get(threadId, function(err, obj) {
      if (err) return reject(err);
      if (obj) return threadReady(null, obj);
      apiRequest(inbox, 'get', formatUrl('%@/threads/%@', self.namespaceUrl(), threadId),
        threadReady);

      function threadReady(err, data) {
        if (err) return reject(err);
        cache.persist(threadId, data, noop);
        resolve(new INThread(self, data));
      }
    });
  });
};

/**
 * @function
 * @name INNamespace#contacts
 *
 * @description
 * A method which fetches contacts from the server, optionally updating an array of contacts, and
 * optionally filtered. If either filters or optional contacts are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INContact>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INContact objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated threads, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.contacts = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INContact, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#tags
 *
 * @description
 * A method which fetches tags from the server, optionally updating an array of tags, and
 * optionally filtered. If either filters or optional tags are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INTag>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INTag objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated tags, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.tags = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INTag, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#drafts
 *
 * @description
 * A method which fetches drafts from the server, optionally updating an array of drafts, and
 * optionally filtered. If either filters or optional drafts are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INDraft>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INTag objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated drafts, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.drafts = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INDraft, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#draft
 *
 * @description
 * Returns a new {INDraft} object, enabling the caller to create a new message to send. This is the
 * primary API for sending messages with Inbox.js.
 * With an argument, retrieves an existing {INDraft} object.
 *
 * @param {string} Optionally, an ID of a draft to retrieve.
 *
 * @returns {INDraft} the newly constructed INDraft object, or a promise containing either the fetched
 *   draft from the server or an error message.
 */
INNamespace.prototype.draft = function(draft_id) {
  if (draft_id === void 0)
    return new INDraft(this, null);

  if (typeof(draft_id) !== "string") {
    throw new Error('expected string|undefined in INNamespace.draft()');
  }

  var self = this;
  return this.promise(function (resolve, reject) {
    var url = formatUrl('%@/%@/%@', self.resourceUrl(), INDraft.resourceName(), draft_id);
    apiRequest(self.inbox(), 'get', url, function (err, result) {
      if (err) return reject(err);
      return resolve(new INDraft(self, result));
    });
  });
};


/**
 * @function
 * @name INNamespace#files
 *
 * @description
 * A method which fetches files from the server, optionally updating an array of drafts, and
 * optionally filtered. If either filters or optional drafts are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INFile>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INTag objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated drafts, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.files = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INFile, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#messages
 *
 * @description
 * A method which fetches messages from the server, optionally updating an array of drafts, and
 * optionally filtered. If either filters or optional drafts are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INMessage>|object=} existingArrayOrFilters Optionally, either an Array of
 *   INTag objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated drafts, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.messages = function(existingArrayOrFilters, filters) {
  return this.fetchCollection(INMessage, existingArrayOrFilters, filters);
};


/**
 * @function
 * @name INNamespace#fetchCollection
 *
 * @description
 * A method which fetches a collection of items from the server, optionally updating an existing array and
 * optionally filtered. If either filters or optional existing array are provided, the system will not
 * use the cache and go directly to the server.
 *
*/
INNamespace.prototype.fetchCollection = function(klass, existingArrayOrFilters, filters) {
  var self = this;
  var inbox = this.inbox();
  var cache = inbox._.cache;
  var existingArray = null;

  if (existingArrayOrFilters && typeof existingArrayOrFilters === 'object') {
    if (isArray(existingArrayOrFilters)) {
      existingArray = existingArrayOrFilters;
    } else if (!filters) {
      filters = existingArrayOrFilters;
    }
  }
  if (filters && typeof filters !== 'object') {
    filters = null;
  }

  return this.promise(function(resolve, reject) {
    // note: we don't currently support caching when there are filters
    if (existingArray || filters) {
      var url = formatUrl('%@/%@%@', self.resourceUrl(), klass.resourceName(), applyFilters(filters));
      return apiRequest(inbox, 'get', url, responseReady);
    } else {
      cache.getByType('namespace', function(err, returnedArray) {
        if (err) return reject(err);
        if (returnedArray && returnedArray.length) return responseReady(null, returnedArray);
        var url = formatUrl('%@/%@', self.resourceUrl(), klass.resourceName());
        apiRequest(inbox, 'get', url, responseReady);
      });
    }

    function responseReady(err, returnedArray) {
      if (err) return reject(err);

      var constructor = function(item) {
        cache.persist(item.id, item, noop);
        return new klass(self, item);
      };

      if (existingArray) {
        return resolve(mergeModelArray(existingArray, returnedArray, 'id', constructor));
      } else {
        return resolve(map(returnedArray, constructor));
      }
    }
  });
};


/**
 * @function
 * @name INNamespace#uploadFile
 *
 * @description
 * Method for uploading a file to the server. The uploaded file is not attached to a message
 * immediately, but the caller has the option of attaching it to a message manually using the
 * applicable {INDraft} methods.
 *
 * @param {string|File} fileNameOrFile Either a File object. A File object is essentially a
 *   Blob with metadata (filename, mimetype). If the fileNameOrFile parameter is a File, then
 *   the second parameter may be ignored. Otherwise, if it is a string, it is treated as the
 *   filename for the associated blob object.
 * @param {Blob=} blobForFileName A Blob object containing the data to be uploaded to the
 *   server.
 *
 * @returns {Promise} a promise to be fulfilled with the response from the server, or an
 *   exception which may be thrown.
 */
INNamespace.prototype.uploadFile = function(fileNameOrFile, blobForFileName) {
  var self = this;
  return this.promise(function(resolve, reject) {
    uploadFile(self, fileNameOrFile, blobForFileName, function(err, response) {
      if (err) {
        if (typeof err == 'string') {
          err = new Error('Cannot invoke `uploadFile()` on INNamespace: ' + err);
        }
        return reject(err);
      }
      return resolve(response);
    });
  });
};


/**
 * @function
 * @name getNamespace
 * @private
 *
 * @description
 * This routine is not spectacularly useful, and needs to be replaced with a better mechanism. At
 * the moment, it will only construct a new INNamespace, but ideally it should return the current
 * instance of the namespace with the correct namespace ID, or pull it from the cache if necessary.
 *
 * If the namespace can't be found from the cache, only then should it construct a new instance.
 */
function getNamespace(inbox, namespaceId) {
  // TODO(@caitp): we should use LRU cache or something here, but since there's no way to know when
  // namespaces are collected, it's probably better to just create a new instance all the time.
  return new INNamespace(inbox, namespaceId);
}
