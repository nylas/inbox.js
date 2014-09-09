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
  INModelObject.call(this, inbox, id, namespaceId);
}

inherits(INFile, INModelObject);


/**
 * @function
 * @name INFile#resourceName
 *
 * @description
 * Returns the name of the resource used when constructing URLs
 *
 * @returns {string} the resource path of the file.
 */
INFile.resourceName = INFile.prototype.resourceName = function() {
  return 'files';
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
  if (this.isUnsynced())
    return null;
  return this.resourceUrl()+'/download';
};


/**
 * @function
 * @name INFile#download
 *
 * @description
 * Downloads the file using XHR2, rather than the native browser.
 *
 * At this time, it is not possible to get progress readings from the file download.
 *
 * @returns {Promise} A promise to be fulfilled with the downloaded Blob in supporting browsers, or
 *   rejected with an error. If fulfilled with a blob, the blob may have a `fileName` property,
 *   indicating the current filename of the INFile at the time the promise was fulfilled.
 */
INFile.prototype.download = function() {
  var self = this;
  var url = this.downloadUrl();
  var filename = this.filename || this.id;
  var contentType = this.contentType || 'text/plain;charset=utf-8';

  return this.promise(function(resolve, reject) {
    apiRequest(self.inbox(), 'get', url, null, 'arraybuffer', function(err, response) {
      if (err) return reject(err);
      var blob = new Blob([response], {
        type: contentType
      });

      blob.fileName = filename;

      resolve(blob);
    });
  });
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
 * Mimetype of the file resource, such as 'application/csv' or 'image/png'.
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
 * The object type, which is always 'file'.
 */
defineResourceMapping(INFile, {
  'filename': 'filename',
  'contentType': 'content_type',
  'size': 'int:size',
  'messageID': 'message_id',
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

    // ASSERT(isArray(response) && response.length === 1)
    if (!(isArray(response) && response.length === 1)) {
      return callback(formatString('response for url `%@` must be an array.', url), null);
    }
    callback(null, makeFile(response[0]));

    function makeFile(item) {
      item = new INFile(namespace, item);
      persistModel(item);
      return item;
    }
  });
}
