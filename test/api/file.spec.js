describe('INFile', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var mockFile1;
  var inbox;
  var server;

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.nylas.com/'
    });

    mockFile1 = {
        "id": '84umizq7c4jtrew491brpa6iu',
        "filename": "image.jpg",
        "namespace": 'fake_namespace_id'
    };
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.nylas.com/'
    });
  });

  afterEach(function() {
    server.restore();
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
  });

  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INFile(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should be <baseUrl>/n/<namespaceId>/files/<filesId>', function() {
      expect ((new INFile(namespace, mockFile1)).resourceUrl()).toBe('http://api.nylas.com/n/fake_namespace_id/files/84umizq7c4jtrew491brpa6iu');
    });
  });


  describe('downloadUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INFile(inbox, null, 'fake_namespace_id')).downloadUrl()).toBe(null);
    });

    it('should be <baseUrl>/n/<namespaceId>/files/<filesId>/download', function() {
      expect ((new INFile(namespace, mockFile1)).downloadUrl()).toBe('http://api.nylas.com/n/fake_namespace_id/files/84umizq7c4jtrew491brpa6iu/download');
    });
  });


  describe('download()', function() {
    it ('should return a promise that yields a blob', function () {
      var file = new INFile(namespace, mockFile1);
      var fulfilled = jasmine.createSpy('load').andCallFake(function(response) {
        expect(response instanceof Blob).toBe(true);
      });
      var promise = file.download().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, 'garbage data']);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });

    it ('should yield a blob with the correct filename', function () {
      var file = new INFile(namespace, mockFile1);
      var fulfilled = jasmine.createSpy('load').andCallFake(function(blob) {
        expect(blob.fileName).toBe(file.filename);
      });
      var promise = file.download().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, 'garbage data']);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });
});
