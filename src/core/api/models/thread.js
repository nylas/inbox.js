/**
 * @class INThread
 * @constructor
 * @augments INModelObject
 *
 * @description
 * Model representing a single Thread.
 */
function INThread(inbox, id, namespaceId) {
  INModelObject.call(this, inbox, id, namespaceId);
}

inherits(INThread, INModelObject);


/**
 * @function
 * @name INThread#resourceName
 *
 * @description
 * Returns the name of the resource used when constructing URLs
 *
 * @returns {string} the resource path of the file.
 */
INThread.resourceName = INThread.prototype.resourceName = function() {
  return 'threads';
};


/**
 * @function
 * @name INThread#reply
 *
 * @description
 * Returns a new {INDraft} object in reply to this thread.
 *
 * @returns {INDraft} the newly constructed draft message.
 */
INThread.prototype.reply = function() {
  var data = this.raw();
  delete data.id;
  var draft = new INDraft(this.namespace(), data);
  draft.threadId = this.id;
  return draft;
};


/**
 * @function
 * @name INThread#messages
 *
 * @description
 * A method which fetches messages from the server, associated with the thread on which the method
 * is invoked, optionally updating an array of messages, and optionally filtered.
 *
 * It is not currently possible to fetch messages associated with a particular thread from the
 * cache. TODO(@caitp): this should be possible.
 *
 * @param {Array<INMessage>|object=} optionalMessagesOrFilters Optionally, either an Array of
 *   INMessage objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated messages, or error from
 *   the server.
 */
INThread.prototype.messages = function(optionalMessagesOrFilters, filters) {
  return this.namespace().fetchCollection(INMessage, {threadId: this.id});
};


/**
 * @function
 * @name INThread#drafts
 *
 * @description
 * A method which fetches drafts from the server, associated with the thread on which the method
 * is invoked, optionally updating an array of drafts, and optionally filtered.
 *
 * It is not currently possible to fetch drafts associated with a particular thread from the
 * cache. TODO(@caitp): this should be possible.
 *
 * @param {Array<INMessage>|object=} optionalDraftsOrFilters Optionally, either an Array of
 *   INDraft objects to be updated with the response, or an object containing filters to apply
 *   to the URL.
 * @param {object=} filters An optional object containing filters to apply to the URL.
 *
 * @returns {Promise} a promise to be fulfilled with the new or updated messages, or error from
 *   the server.
 */
INThread.prototype.drafts = function(optionalDraftsOrFilters, filters) {
  return this.namespace().fetchCollection(INDraft, {threadId: this.id});
};


/**
 * @function
 * @name INThread#updateTags
 *
 * @description
 * A method which makes a request with method PUT to the endpoint
 * `/n/<namespace_id>/threads/<thread_id>` with keys `add_tags` and `remove_tags`, and expects a
 * successful response to be the updated Thread model value.
 *
 * @param {Array<string>} addTags A collection of tag names to be added to the thread.
 * @param {Array<string>} removeTags A collection of tag names to be removed from the thread.
 *
 * @returns {Promise} a promise to be fulfilled with the Thread after having been updated
 */
INThread.prototype.updateTags = function(addTags, removeTags) {
  var self = this;
  var url = formatUrl('%@/threads/%@', this.namespaceUrl(), this.id);
  if (!isArray(addTags)) addTags = [];
  if (!isArray(removeTags)) removeTags = [];

  return this.promise(function(resolve, reject) {
    apiRequest(self.inbox(), 'put', url, toJSON({
      'add_tags': addTags,
      'remove_tags': removeTags
    }), function(err, thread) {
      if (err) return reject(err);
      self.update(thread);
      persistModel(self);
      resolve(self);
    });
  });
};


/**
 * @function
 * @name INThread#addTags
 *
 * @description
 * A method which makes a request with method PUT to the endpoint
 * `/n/<namespace_id>/threads/<thread_id>` with keys `add_tags` and `remove_tags`, and expects a
 * successful response to be the updated Thread model value.
 *
 * Convenience method which invokes INThread#updateTags.
 *
 * @param {Array<string>} addTags A collection of tag names to be added to the thread.
 *
 * @returns {Promise} a promise to be fulfilled with the Thread after having been updated
 */
INThread.prototype.addTags = function(addTags) {
  return this.updateTags(addTags, null);
};


/**
 * @function
 * @name INThread#removeTags
 *
 * @description
 * A method which makes a request with method PUT to the endpoint
 * `/n/<namespace_id>/threads/<thread_id>` with keys `add_tags` and `remove_tags`, and expects a
 * successful response to be the updated Thread model value.
 *
 * Convenience method which invokes INThread#updateTags.
 *
 * @param {Array<string>} removeTags A collection of tag names to be removed from the thread.
 *
 * @returns {Promise} a promise to be fulfilled with the Thread after having been updated
 */
INThread.prototype.removeTags = function(removeTags) {
  return this.updateTags(null, removeTags);
};


/**
 * @function
 * @name INThread#hasTag
 *
 * @description
 * Searches the thread's tagData collection for a tag with the specified tag name. The search is
 * case-sensitive.
 *
 * @param {Array<string>} tagName Name of a tag to search for within the thread's tagData
 *   collection.
 *
 * @returns {boolean} Returns true if the tag name is present within the thread, otherwise
 *   false.
 */
INThread.prototype.hasTag = function(tagName) {
  for (var i = 0; i < this.tagData.length; ++i) {
    var tag = this.tagData[i];
    if (tag && (tag.tagName === tagName || tag.name === tagName)) {
      return true;
    }
  }
  return false;
};

/**
 * @property
 * @name INThread#subject
 *
 * The subject line for the thread.
 */


/**
 * @property
 * @name INThread#subjectDate
 *
 * The message date of the first message in the thread.
 */


/**
 * @property
 * @name INThread#participants
 *
 * An array of Participant objects representing accounts who have participated in the thread. Each
 * element of the array has the properties 'name' and 'email'.
 */


/**
 * @property
 * @name INThread#lastMessageDate
 *
 * The date of the most recent message in the thread.
 */


/**
 * @property
 * @name INThread#messageIDs
 *
 * An array of strings, each element of the array representing a single INMessage ID.
 */


/**
 * @property
 * @name INThread#draftIDs
 *
 * An array of strings, each element of the array representing a single INDraft ID.
 */


/**
 * @property
 * @name INThread#tagData
 *
 * An array of Tag objects (not INTag resources).
 */


/**
 * @property
 * @name INThread#labelData
 *
 * An array of Label objects (not INLabel resources).
 */


/**
 * @property
 * @name INThread#snippet
 *
 * A string containing a short snippet of text from the thread, useful for user interfaces.
 */


/**
 * @property
 * @name INThread#object
 *
 * The resource type, always 'thread'.
 */
defineResourceMapping(INThread, {
  'subject': 'subject',
  'subjectDate': 'date:subject_date',
  'participants': 'array:participants',
  'lastMessageDate': 'date:last_message_timestamp',
  'messageIDs': 'array:message_ids',
  'draftIDs': 'array:draft_ids',
  'tagData': 'array:tags',
  'labelData': 'array:labels',
  'snippet': 'snippet',
  'object': 'const:thread'
});
