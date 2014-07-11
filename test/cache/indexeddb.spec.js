describe('IndexedDBCache', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;
  var supported = window.indexedDB &&
                  typeof window.indexedDB === 'object' &&
                  typeof window.indexedDB.open === 'function';
  var token;
  var cache;

  var mockNamespace = {
    "account": "fake_account_id",
    "email_address": "fake.email@inboxapp.co",
    "id": "fake_namespace_id",
    "namespace": "fake_namespace_id",
    "object": "namespace",
    "provider": "FakeProvider"
  };

  var mockNamespace2 = {
    "account": "fake_account_id_2",
    "email_address": "fake.email_2@inboxapp.co",
    "id": "fake_namespace_id_2",
    "namespace": "fake_namespace_id_2",
    "object": "namespace",
    "provider": "FakeProvider"
  };

  var mockNamespaces = [
    mockNamespace,
    mockNamespace2
  ];

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    if (!supported) return;
    token = 'test@' + __randomBase36();
    cache = new IndexedDBCache(token);
    var didRun = false;
    cache.onStatusChanged(function(status) {
      if (status === 'ready') {
        setTimeout(function() {
          if (runTest) runTest();
        });
        didRun = true;
      }
    });

    inbox = new InboxAPI({
      appId: 'test',
      cache: cache,
      baseUrl: 'http://inboxapp.co/'
    });
  });

  afterEach(function() {
    if (supported) {
      window.indexedDB.deleteDatabase(token);
    }
    token = null;
    runTest = null;
    server.restore();
    inbox = null;
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
  });

  it('should use cached objects for responses', function(done) {
    runTest = function() {
      cache.put('namespaces', mockNamespaces, function() {
        var fulfilled = jasmine.createSpy('fulfilled').andCallFake(function(namespaces) {
          expect(namespaces.length).toBe(2);
          expect(namespaces[0] instanceof InboxNamespace).toBe(true);
          expect(namespaces[1] instanceof InboxNamespace).toBe(true);
        });
        inbox.namespaces().then(fulfilled);
        mockPromises.executeForPromise(promise);
        expect(fulfilled).toHaveBeenCalled();
        done();
      });
    };
  });
});
