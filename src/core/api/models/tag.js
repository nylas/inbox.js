/**
 * @class INTag
 * @constructor
 * @augments INModelObject
 *
 * @description
 * A small resource representing a Tag object from the Inbox API.
 */
function INTag(inbox, id, namespaceId) {
  if (inbox instanceof INNamespace) {
    namespaceId = inbox;
    inbox = namespaceId.inbox();
  }
  var data = null;
  if (id && typeof id === 'object') {
    data = id;
    id = data.id;
    namespaceId = data.namespace || data.namespaceId;
  }
  INModelObject.call(this, inbox, id, namespaceId);
  if (data) this.update(data);
}

inherits(INTag, INModelObject);


/**
 * @function
 * @name INTag#resourcePath
 *
 * @description
 * Currently, Tags have no concept of an unsynced state, and it is not possible to fetch metadata
 * for a single tag. So because of this, {INTag#resourcePath} is only capable of returning a single
 * URL: <baseURL>/n/<namespaceID>/tags.
 *
 * @returns {string} the resource path for the Tag object. This resource path is not meaningful,
 *   see the description for details.
 */
INTag.prototype.resourcePath = function() {
  return formatUrl('%@/tags', this.namespaceUrl());
};


var localizedTagNames = {
  'archive': 'Archive',
  'inbox': 'Inbox',
  'unread': 'Unread',
  'sent': 'Sent',
  'starred': 'Starred'
};


/**
 * @function
 * @name INTag#name
 *
 * @description
 * Returns the tag name, with the first letter of each word capitalized.
 *
 * TODO(@caitp): support returning localized tag names. Currently, the placeholder fakes
 * localization, but it should be possible to localize for real.
 *
 * @returns {string} the capitalized tag name.
 */
INTag.prototype.name = function() {
  if (hasProperty(localizedTagNames, this.tagName)) {
    return localizedTagNames[this.tagName];
  }
  return capitalizeString(this.tagName);
};


/**
 * @function
 * @name INTag#threads
 *
 * @description
 * A method which fetches threads from the server, optionally updating an array of threads, and
 * optionally filtered. If either filters or optional threads are provided, the system will not
 * use the cache and go directly to the server.
 *
 * This method automatically defers to {INNamespace#threads}, filtering by the current tagname.
 *
 * @param {Array<INThread>|object=} optionalThreadsOrFilters Optionally, either an Array of
 *   INThread objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated threads, or error from
 *   the cache subsystem or from the server.
 */
INTag.prototype.threads = function(optionalThreadsOrFilters, filters) {
  var namespace = this.namespace();
  var updateThreads = null;

  if (!namespace) return this.promise(function(resolve, reject) {
    reject(new Error('Cannot invoke `threads()` on INTag: not attached to a namespace.'));
  });

  if (optionalThreadsOrFilters && typeof optionalThreadsOrFilters === 'object') {
    if (isArray(optionalThreadsOrFilters)) {
      updateThreads = optionalThreadsOrFilters;
    } else {
      filters = optionalThreadsOrFilters;
    }
  }
  if (!filters || typeof filters !== 'object') {
    filters = {};
  }
  filters.tag = this.id;
  return namespace.threads(updateThreads, filters);
};


/**
 * @property
 * @name INTag#tagName
 *
 * The un-localized name of the tag. Custom tag-names are prefixed with the provider they are
 * associated with. TODO(@caitp): provide an accessor for the provider-prefixed tag name.
 */


/**
 * @property
 * @name INTag#object
 *
 * The resource type, always "tag".
 */
defineResourceMapping(INTag, {
  'tagName': 'name',
  'object': 'const:tag'
});
