/**
 * @class INFile
 * @constructor
 * @augments INModelObject
 *
 * @description
 * Represents a file, which may have been attached to a draft or message, or may be being uploaded
 * locally.
 */
function INFile(inbox, id, namespaceId) {
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

inherits(INFile, INModelObject);


/**
 * @function
 * @name INFile#resourcePath
 *
 * @description
 * If unsynced, returns the path for uploading files:  <baseURL>/n/<namespaceID>/files, and one
 * should only POST to this url.
 *
 * Otherwise, the path is <baseURL>/n/<namespaceID>/files/<fileID>, and may be PUT or PATCH'd.
 *
 * @returns {string} the resource path of the file.
 */
INFile.prototype.resourcePath = function() {
  if (this.isUnsynced()) {
    return formatUrl('%@/files', this.namespaceUrl());
  }
  return formatUrl('%@/files/%@', this.namespaceUrl(), this.id);
};


/**
 * @function
 * @name INFile#downloadUrl
 *
 * @description
 * Returns the URL for downloading synced File objects or attachments from the server, or NULL if
 * the file is unsynced.
 *
 * The URL is of the format <baseURL>/n/<namespaceID>/files/<fileID>/download. Note, the file need
 * not belong to a namespace associated with a downloader's own account.
 *
 * @returns {string} the URL to download the attachment or file.
 */
INFile.prototype.downloadUrl = function() {
  if (!this.isUnsynced()) {
    return formatUrl('%@/files/%@/download', this.namespaceId(), this.id);
  }
  return null;
};


/**
 * @property
 * @name INFile#filename
 *
 * Filename metadata which describes the name the file should use when downloaded, and how it should
 * be visually identified in a user interface.
 */


/**
 * @property
 * @name INFile#mimetype
 *
 * Mimetype of the file resource, such as "application/csv" or "image/png".
 */


/**
 * @property
 * @name INFile#messageID
 *
 * The message ID for which this file is attached.
 */


/**
 * @property
 * @name INFile#size
 *
 * File size, in bytes.
 */


/**
 * @property
 * @name INFile#isEmbedded
 *
 * Boolean value defining whether or not the file is embedded in a message.
 */


/**
 * @property
 * @name INFile#object
 *
 * The object type, which is always "file".
 */
defineResourceMapping(INFile, {
  'filename': 'filename',
  'mimetype': 'mimetype',
  'size': 'int:size',
  'messageID': 'message',
  'isEmbedded': 'bool:is_embedded',
  'object': 'const:file'
});


function uploadFile(namespace, fileOrFileName, fileDataOrCallback, callback) {
  if (typeof callback !== 'function') {
    callback = fileDataOrCallback;
    fileDataOrCallback = null;
  }

  var inbox = namespace.inbox();
  var url = formatUrl('%@/files/', namespace.namespaceUrl());
  var data = new window.FormData();
  if (isFile(fileOrFileName)) {
    data.append('file', fileOrFileName);
  } else if (typeof fileOrFileName === 'string' && isBlob(fileDataOrCallback)) {
    data.append('file', fileDataOrCallback, fileOrFileName);
  } else {
    return callback('not a file', null);
  }

  apiRequest(inbox, 'post', url, data, function(err, response) {
    if (err) return callback(err, null);

    callback(null, makeFile(response));

    function makeFile(item) {
      item = new INFile(namespace, item);
      persistModel(item);
      return item;
    }
  });
}
