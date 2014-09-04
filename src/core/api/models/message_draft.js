/**
 * @class INDraft
 * @constructor
 * @augments INMessage
 *
 * @description
 * Represents a draft message, which may or may not be synced to the server. Drafts are typically
 * created with {INMessage#reply}, {INThread#reply}, or {INNamespace#draft}.
 *
 * The draft-message may be sent without being synced to the server.
 */
function INDraft(inbox, id, namespaceId) {
  INMessage.call(this, inbox, id, namespaceId);
}

inherits(INDraft, INMessage);


/**
 * @function
 * @name INDraft#resourcePath
 *
 * @description
 * If the message is synced, the path is <baseURL>/n/<namespaceID>/drafts/<messageID>.
 *
 * There's no real meaning for resourcePaths to unsynced drafts, because unsynced drafts should
 * not exist.
 *
 * @returns {string} the resource path of the message.
 */
INDraft.prototype.resourcePath = function() {
  if (this.isUnsynced())
    return null;
  return formatUrl('%@/drafts/%@', this.namespaceUrl(), this.id);
};

/**
 * @function
 * @name INDraft#addRecipients
 *
 * @description
 * Adds a set of participants to {INDraft#to} --- the set of direct message recipients. These are
 * not CC'd or BCC'd.
 *
 * @param {Array<Object>} participants an array of Participant objects, containing keys 'name' and
 *   'email'. The name should be a name which identifies the recipient, and the email should be
 *   their email address.
 *
 * @returns {INDraft} the INDraft object, 'this', to enable chaining calls.
 */
INDraft.prototype.addRecipients = function(participants) {
  var to = this.to || (this.to = []);
  var i;
  var ii = arguments.length;
  var item;
  for (i = 0; i < ii; ++i) {
    item = arguments[i];
    if (isArray(item)) {
      mergeArray(to, item, 'email');
    }
  }
  return this;
};


/**
 * @function
 * @name INDraft#uploadAttachment
 *
 * @description
 * Uploads a file to the server, and adds the attachment ID from the response to the end of the
 * set of attachment IDs.
 *
 * Uploading files requires that the browser support the FormData object, or a working polyfill.
 * It also requires support for the Blob type. See http://caniuse.com/xhr2 for browser support.
 *
 * Support for legacy browsers may be possible using Flash, or clever hacks with iframes.
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
INDraft.prototype.uploadAttachment = function(fileNameOrFile, blobForFileName) {
  var namespace = this.namespace();
  var self = this;
  return this.promise(function(resolve, reject) {
    uploadFile(self, fileNameOrFile, blobForFileName, function(err, response) {
      if (err) {
        if (typeof err == 'string') {
          err = new Error('Cannot invoke `uploadAttachment()` on INDraft: ' + err);
        }
        return reject(err);
      }
      self.attachmentData.push(response);
      return resolve(response);
    });
  });
};


/**
 * @function
 * @name INDraft#removeAttachment
 *
 * @description
 * Removes an attachment ID from a draft message, and prevents the attachment from being
 * associated with the message.
 *
 * @param {string|INFile} file Either a file ID as a string, or an INFile object.
 *
 * @returns {INDraft} the INDraft object, 'this', to enable chaining calls.
 */
INDraft.prototype.removeAttachment = function(file) {
  if (!file) {
    throw new TypeError(
      'Cannot invoke `removeAttachment()` on INDraft: file must be a file ID or object');
  }
  var id = typeof file === 'string' ? file : file.id;
  var i;
  var ii = this.attachmentData.length;

  for (i = 0; i < ii; ++i) {
    if (this.attachmentData[i].id === id) {
      this.attachmentData.splice(i, 1);
      break;
    }
  }
  return this;
};


/**
 * Shadow INMessage#markAsRead method with 'null', because it is meaningless for draft messages.
 */
INDraft.prototype.markAsRead = null;


/**
 * @function
 * @name INDraft#save
 *
 * @description
 * Save the draft to the server
 *
 * @returns {Promise} promise to be fulfilled with either an API response from the server, or
 *   an exception thrown by apiRequest().
 */
INDraft.prototype.save = function() {
  var pattern = this.isUnsynced() ? '%@/drafts' : '%@/drafts/%@';
  var url = formatUrl(pattern, this.namespaceUrl(), this.id);
  var inbox = this.inbox();
  var self = this;
  var rawJson = this.raw();

  // check the formatting of our participants fields. They must be either undefined or be
  // arrays, and must contain objects that have an email key
  var keys = ['from', 'to', 'cc', 'bcc'];
  for (var ii = 0; ii < keys.length; ii ++) {
    var list = self[keys[ii]];
    var type = Object.prototype.toString.call(list).toLowerCase();
    var valid = false;

    if (type === '[object array]') {
      valid = true;
      for (var ii = 0; ii < list.length; ii++) {
        if ((typeof list[ii] !== 'object') || (!list[ii].hasOwnProperty('email'))) {
          valid = false;
          break;
        }
      }
    } else if (type === '[object undefined]') {
      valid = true;
    }

    if (!valid) {
      throw new TypeError(
      'To, From, CC, and BCC must be arrays of objects with emails and optional names.');
    }
  }

  rawJson.files = map(this.attachmentData, function(data) {
    return data.id;
  });

  rawJson = toJSON(rawJson);

  return this.promise(function(resolve, reject) {
    apiRequest(inbox, 'post', url, rawJson, function(err, response) {
      if (err) return reject(err);
      // Should delete the cached version, if any
      self.update(response);
      deleteModel(self);
      persistModel(self);
      resolve(self);
    });
  });
};


/**
 * @function
 * @name INDraft#send
 *
 * @description
 * Send a draft message to recipients. The draft does not need to be saved to the server before
 * performing this task.
 *
 * @returns {Promise} promise to be fulfilled with the API response from the server, or an
 *   exception which may have been thrown.
 */
INDraft.prototype.send = function() {
  var data;
  var inbox = this.inbox();
  var url = formatUrl('%@/send', this.namespaceUrl());

  if (this.isUnsynced()) {
    // Just send a message
    data = this.raw();
    delete data.id;
    delete data.object;
    data.files = map(this.attachmentData, function(data) {
      return data.id;
    });
    data = toJSON(data);
  } else {
    // Send using the saved ID
    data = toJSON({
      'draft_id': this.id
    });
  }

  return this.promise(function(resolve, reject) {
    apiRequest(inbox, 'post', url, data, function(err, response) {
      // TODO: update a 'state' flag indicating that the value has been saved
      if (err) return reject(err);
      resolve(response);
    });
  });
};


/**
 * @function
 * @name INDraft#dispose
 *
 * @description
 * Delete the draft from both local cache and the server.
 *
 * @returns {Promise} promise fulfilled with either an error from the API, or with the draft itself.
 */
INDraft.prototype.dispose = function() {
  var self = this;
  return this.promise(function(resolve, reject) {
    deleteModel(self);
    if (self.isUnsynced()) {
      // Cached copy is already deleted --- just resolve.
      resolve(self);
    } else {
      apiRequest(self.inbox(), 'delete', this.resourcePath(),
      function(err, response) {
        if (err) return reject(err);
        resolve(self);
      });
    }
  });
};


/**
 * @property
 * @name INDraft#thread
 *
 * If present, this is the ID of the thread to respond to.
 */


/**
 * @property
 * @name INDraft#object
 *
 * The resource type, always 'draft'.
 */
defineResourceMapping(INDraft, {
  'thread': 'reply_to_thread',
  'state': 'state',
  'object': 'const:draft'
}, INMessage);
