/**
 * @class INMessage
 * @constructor
 * @augments INModelObject
 *
 * @description
 * Represents a message associated with a thread. Messages should always be synced to the server,
 * and are not possible to construct locally.
 */
function INMessage(inbox, id, namespaceId) {
  var namespace;
  if (inbox instanceof INNamespace) {
    namespace = inbox;
    inbox = namespace.inbox();
    namespaceId = namespace.id;
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

inherits(INMessage, INModelObject);


/**
 * @function
 * @name INMessage#resourcePath
 *
 * @description
 * If the message is synced, the path is <baseURL>/n/<namespaceID>/messages/<messageID>.
 *
 * There's no real meaning for resourcePaths to unsynced messages, because unsynced messages should
 * not exist. TODO(@caitp): do not return a path for unsynced messages, return null.
 *
 * @returns {string} the resource path of the message.
 */
INMessage.prototype.resourcePath = function() {
  if (!this.isUnsynced()) {
    return formatUrl('%@/messages/%@', this.namespaceUrl(), this.id);
  }
  return formatUrl('%@/messages', this.namespaceUrl());
};


/**
 * @function
 * @name INMessage#thread
 *
 * @description
 * Returns a new instance of INThread, with the appropriate ID and namespaceID.
 *
 * TODO(@caitp): This is a silly operation, this should be done better. It's not a good idea to
 * construct new INThread instances all the time.
 *
 * @returns {INThread} the thread to which this message is associated.
 */
INMessage.prototype.thread = function() {
  if (!this.threadID) {
    return null;
  }

  return new INThread(this.inbox(), this.threadID, this.namespaceId());
};


/**
 * @function
 * @name INMessage#reply
 *
 * @description
 * Returns a new {INDraft} object, with recipients including the `to` and `from` recipients from
 * the message.
 *
 * TODO(caitp): remove own email address from recipients, if present.
 *
 * @returns {INDraft} the newly constructed draft message.
 */
INMessage.prototype.reply = function() {
  var draft = this.thread().reply();
  draft.addRecipients(this.from, this.to);
  return draft;
};


/**
 * @function
 * @name INMessage#attachments
 *
 * @description
 * Returns an array of INFile objects constructed from the attachmentIDs on the message.
 *
 * TODO(caitp): don't construct an unsynced INFile if we can possibly avoid it --- the caching
 * strategy should handle this properly.
 *
 * @returns {Array<INFile>} an array of INFile objects
 */
INMessage.prototype.attachments = function() {
  var array = new Array(this.attachmentData.length);
  forEach(this.attachmentData, function(data, i) {
    array[i] = new INFile(this.inbox(), data, this.namespaceId());
  }, this);
  return array;
};


/**
 * @function
 * @name INMessage#attachment
 *
 * @description
 * Returns an INFile object for the ID at the respective index, or for the requested ID, or
 * null if the attachment is not found.
 *
 * TODO(caitp): don't construct an unsynced INFile if we can possibly avoid it --- the caching
 * strategy should handle this properly.
 *
 * @returns {INFile} an INFile object.
 */
INMessage.prototype.attachmentsPromise = function() {
  var self = this;
  var filters = {};
  return this.promise(function(resolve, reject) {
    var url = formatUrl('%@/files%@', self.namespaceUrl(), applyFilters(filters));
    apiRequest(self.inbox(), 'get', url, function(err, response) {
      if (err) return reject(err);
      return resolve(map(response, function(data) {
        persistModel(data = new INFile(self.inbox(), data));
        return data;
      }));
    });
  });
};


INMessage.prototype.attachment = function(indexOrId) {
  var index;
  if (typeof indexOrId === 'number') {
    index = indexOrId >>> 0;
  } else if (typeof indexOrId === 'string') {
    var i;
    var ii = this.attachmentData.length;
    for (i=0; i<ii; ++i) {
      if (indexOrId === this.attachmentData[i].id) {
        index = i;
        break;
      }
    }
  } else {
    throw new TypeError(
      'Cannot invoke `attachment()` on INMessage: expected attachment index or attachment ID');
  }

  if (typeof index === 'undefined') {
    return null;
  }

  var data = this.attachmentData[index];

  if (typeof data === 'undefined') {
    return null;
  }

  return new INFile(this.inbox(), data, this.namespaceId());
};


/**
 * @function
 * @name INMessage#markAsRead
 *
 * @description
 * Marks the message as read. This operation is saved to the server immediately. However, if the
 * message is unsynced, no request is ever made.
 *
 * @returns {Promise} a promise to be fulfilled with the INMessage object, "this".
 */
INMessage.prototype.markAsRead = function() {
  var self = this;
  if (this.isUnsynced()) {
    return this.promise(function(resolve) {
      self.unread = false;
      resolve(self);
    });
  }
  return apiRequestPromise(this.inbox(), 'put', this.resourcePath(), {
    unread: false
  }, function(value) {
    self.update(value);
    return self;
  });
};


/**
 * @property
 * @name INMessage#subject
 *
 * The subject line for the message.
 */


/**
 * @property
 * @name INMessage#body
 *
 * The message body, the contents of the message.
 */


/**
 * @property
 * @name INMessage#threadID
 *
 * The threadID to which this message belongs.
 */


/**
 * @property
 * @name INMessage#date
 *
 * The date and time at which the message was sent.
 */


/**
 * @property
 * @name INMessage#from
 *
 * An array of Participant objects, each element containing string "name" and string "email". These
 * are used to identify the senders of the message.
 */


/**
 * @property
 * @name INMessage#to
 *
 * An array of Participant objects, each element containing string "name" and string "email". These
 * are used to identify the recipients of the message.
 */


/**
 * @property
 * @name INMessage#unread
 *
 * A boolean flag --- true if the message has not yet been marked as read (see
 * {INMessage#markAsRead}), or false if the message has been marked.
 */


/**
 * @property
 * @name INMessage#attachmentIDs
 *
 * An array of strings (attachment IDs), representing the files attached to this message.
 */


/**
 * @property
 * @name INMessage#object
 *
 * The resource type, always "message".
 */
defineResourceMapping(INMessage, {
  'subject': 'subject',
  'body': 'body',
  'threadID': 'thread',
  'date': 'date:date',
  'from': 'array:from',
  'to': 'array:to',
  'cc': 'array:cc',
  'bcc': 'array:bcc',
  'unread': 'bool:unread',
  'attachmentData': 'array:files',
  'object': 'const:message'
});
