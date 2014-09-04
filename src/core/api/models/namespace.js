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
 * @name INNamespace#resourceUrl
 *
 * @description
 * The URL for the resource. If the namespace is synced, the URL is <baseURL>/n/<namespaceID>.
 * There is no real concept of unsynced namespaces yet, however if the namespace IS unsynced
 * for some reason, the result is <baseURL>/n/.
 *
 * @returns {string} the resource path of the namespace.
 */
INNamespace.prototype.resourceUrl = function() {
  if (this.isUnsynced()) {
    return formatUrl('%@/n/', this.baseUrl());
  }
  return formatUrl('%@/n/%@', this.baseUrl(), this.id);
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
 * @name INNamespace#threads
 *
 * @description
 * A method which fetches threads from the server, optionally updating an array of threads, and
 * optionally filtered. If either filters or optional threads are provided, the system will not
 * use the cache and go directly to the server.
 *
 * @param {Array<INThread>|object=} optionalThreadsOrFilters Optionally, either an Array of
 *   INThread objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated threads, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.threads = function(optionalThreadsOrFilters, filters) {
  var self = this;
  var inbox = this.inbox();
  var cache = inbox._.cache;
  var updateThreads = null;

  if (optionalThreadsOrFilters && typeof optionalThreadsOrFilters === 'object') {
    if (isArray(optionalThreadsOrFilters)) {
      updateThreads = optionalThreadsOrFilters;
    } else if (!filters) {
      filters = optionalThreadsOrFilters;
    }
  }
  if (filters && typeof filters !== 'object') {
    filters = null;
  }

  return this.promise(function(resolve, reject) {
    if (updateThreads || filters) {
      return apiRequest(inbox, 'get', formatUrl('%@/threads%@',
        self.resourceUrl(), applyFilters(filters)), threadsReady);
    }

    cache.getByType('namespace', function(err, set) {
      if (err) return reject(err);
      if (set && set.length) return threadsReady(null, set);
      apiRequest(inbox, 'get', formatUrl('%@/threads',
        self.resourceUrl()), threadsReady);
    });

    function threadsReady(err, set) {
      if (err) return reject(err);

      if (updateThreads) {
        return resolve(mergeArray(updateThreads, set, 'id', function(data) {
          cache.persist(data.id, data, noop);
          return new INThread(self, data);
        }, INThread));
      }

      resolve(map(set, function(item) {
        cache.persist(item.id, item, noop);
        return new INThread(self, item);
      }));
    }
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
 * @param {Array<INContact>|object=} optionalContactsOrFilters Optionally, either an Array of
 *   INContact objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated threads, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.contacts = function(optionalContactsOrFilters, filters) {
  var self = this;
  var inbox = this.inbox();
  var cache = inbox._.cache;
  var updateContacts = null;

  if (optionalContactsOrFilters && typeof optionalContactsOrFilters === 'object') {
    if (isArray(optionalContactsOrFilters)) {
      updateContacts = optionalContactsOrFilters;
    } else if (!filters) {
      filters = optionalContactsOrFilters;
    }
  }
  if (filters && typeof filters !== 'object') {
    filters = null;
  }

  return this.promise(function(resolve, reject) {
    if (updateContacts || filters) {
      return apiRequest(inbox, 'get', formatUrl('%@/contacts%@',
        self.resourceUrl(), applyFilters(filters)), contactsReady);
    }

    cache.getByType('namespace', function(err, set) {
      if (err) return reject(err);
      if (set && set.length) return contactsReady(null, set);
      apiRequest(inbox, 'get', formatUrl('%@/contacts',
        self.resourceUrl()), contactsReady);
    });

    function contactsReady(err, set) {
      if (err) return reject(err);

      if (updateContacts) {
        return resolve(mergeArray(updateContacts, set, 'id', function(data) {
          cache.persist(data.id, data, noop);
          return new INContact(self, data);
        }, INContact));
      }

      resolve(map(set, function(item) {
        cache.persist(item.id, item, noop);
        return new INContact(self, item);
      }));
    }
  });
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
 * @param {Array<INTag>|object=} optionalTagsOrFilters Optionally, either an Array of
 *   INTag objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated tags, or error from
 *   the cache subsystem or from the server.
 */
INNamespace.prototype.tags = function(optionalTagsOrFilters, filters) {
  var self = this;
  var inbox = this.inbox();
  var cache = inbox._.cache;
  var updateTags = null;

  if (optionalTagsOrFilters && typeof optionalTagsOrFilters === 'object') {
    if (isArray(optionalTagsOrFilters)) {
      updateTags = optionalTagsOrFilters;
    } else if (!filters) {
      filters = optionalTagsOrFilters;
    }
  }
  if (filters && typeof filters !== 'object') {
    filters = null;
  }

  return this.promise(function(resolve, reject) {
    if (updateTags || filters) {
      return apiRequest(inbox, 'get', formatUrl('%@/tags%@',
        self.resourceUrl(), applyFilters(filters)), tagsReady);
    }

    cache.getByType('namespace', function(err, set) {
      if (err) return reject(err);
      if (set && set.length) return tagsReady(null, set);
      apiRequest(inbox, 'get', formatUrl('%@/tags',
        self.resourceUrl()), tagsReady);
    });

    function tagsReady(err, set) {
      if (err) return reject(err);

      if (updateTags) {
        return resolve(mergeArray(updateTags, set, 'id', function(data) {
          cache.persist(data.id, data, noop);
          return new INTag(self, data);
        }, INTag));
      }

      resolve(map(set, function(item) {
        cache.persist(item.id, item, noop);
        return new INTag(self, item);
      }));
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
 * @name INNamespace#draft
 *
 * @description
 * Returns a new {INDraft} object, enabling the caller to create a new message to send. This is the
 * primary API for sending messages with Inbox.js.
 *
 * @returns {INDraft} the newly constructed INDraft object.
 */
INNamespace.prototype.draft = function() {
  return new INDraft(this, null);
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
