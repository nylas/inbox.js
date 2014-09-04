describe('INFile', function() {
  var mockFile1;
  var inbox;
  
  beforeEach(function() {
    mockFile1 = {
        "id": '84umizq7c4jtrew491brpa6iu',
        "namespace": 'fake_namespace_id'
    };
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
    });
  });


  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INFile(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should be <baseUrl>/n/<namespaceId>/files/<filesId>', function() {
      expect ((new INFile(namespace, mockFile1)).resourceUrl()).toBe('http://api.inboxapp.co/n/fake_namespace_id/files/84umizq7c4jtrew491brpa6iu');
    });
  });


  describe('downloadUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INFile(inbox, null, 'fake_namespace_id')).downloadUrl()).toBe(null);
    });

    it('should be <baseUrl>/n/<namespaceId>/files/<filesId>/download', function() {
      expect ((new INFile(namespace, mockFile1)).downloadUrl()).toBe('http://api.inboxapp.co/n/fake_namespace_id/files/84umizq7c4jtrew491brpa6iu/download');
    });
  });


  describe('download()', function() {

  });
});


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
    return formatUrl('%@/files/%@/download', this.namespaceUrl(), this.id);
  }
  return null;
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
