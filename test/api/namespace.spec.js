describe('INNamespace', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;

  var mockNamespace = {
    "account": "fake_account_id",
    "email_address": "fake.email@inboxapp.co",
    "id": "fake_namespace_id",
    "namespace": "fake_namespace_id",
    "object": "namespace",
    "provider": "FakeProvider"
  };

  var mappedNamespace = {
    "account": "fake_account_id",
    "emailAddress": "fake.email@inboxapp.co",
    "id": "fake_namespace_id",
    "namespaceID": "fake_namespace_id",
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

  var mappedNamespace2 = {
    "account": "fake_account_id_2",
    "emailAddress": "fake.email_2@inboxapp.co",
    "id": "fake_namespace_id_2",
    "namespaceID": "fake_namespace_id_2",
    "object": "namespace",
    "provider": "FakeProvider"
  };

  var mockNamespaces = [
    mockNamespace,
    mockNamespace2
  ];

  var mockNotFound = {
    "message": "Couldn't find namespace with id `not_found_namespace_id` ",
    "type": "invalid_request_error"
  };

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
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


  it('should be a child class of INModelObject', function() {
    expect(new INNamespace() instanceof INModelObject).toBe(true);
  });


  describe('when unsynced', function() {
    it('should have resourcePath() like <baseUrl>/n/', function() {
      expect ((new INNamespace(inbox)).resourcePath()).toBe('http://api.inboxapp.co/n/');
    });
  });


  describe('when synced', function() {
    it('should have resourcePath() like <baseUrl>/n/<id>', function() {
      expect ((new INNamespace(inbox, 'fake_id')).resourcePath()).toBe('http://api.inboxapp.co/n/fake_id');
    });
  });


  describe('InboxAPI#namespaces()', function() {
    it('should be a method of InboxAPI', function() {
      expect(typeof inbox.namespaces).toBe('function');
    });


    it('should resolve promise with an array of InboxNamespaces', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespaces) {
        expect(namespaces.length).toBe(2);
        expect(namespaces[0] instanceof INNamespace).toBe(true);
        expect(namespaces[1] instanceof INNamespace).toBe(true);
      });
      var promise = inbox.namespaces().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into resources', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespaces) {
        expect(namespaces[0]).toContainObject(mappedNamespace);
        expect(namespaces[1]).toContainObject(mappedNamespace2);
      });
      var promise = inbox.namespaces().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = inbox.namespaces();
      server.respond([404, { "Content-Type": "application/json" }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    it('should update passed array of namespaces', function() {
      var oldNamespaces = [mockNamespace];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespaces) {
        expect(namespaces.length).toBe(2);
        expect(namespaces).toBe(oldNamespaces);
        expect(namespaces[0]).toBe(oldNamespaces[0]);
        expect(namespaces[1]).toContainObject(mappedNamespace2);
        expect(namespaces[1] instanceof INNamespace).toBe(true);
      });
      var promise = inbox.namespaces(oldNamespaces).then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('InboxAPI#namespace()', function() {
    it('should resolve promise with an instance of InboxNamespace', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace instanceof INNamespace).toBe(true);
      });
      var promise = inbox.namespace('fake_namespace_id').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespace)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into new resource', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace).toContainObject(mappedNamespace);
      });
      var promise = inbox.namespace('fake_namespace_id').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespace)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = inbox.namespace('not_found_namespace_id');
      server.respond([401, { "Content-Type": "application/json" }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    describe('errors', function() {
      it('should be thrown when first parameter is not present', function() {
        expect(function() {
          inbox.namespace();
        }).toThrow("Unable to perform 'namespace()' on InboxAPI: missing option `namespaceId`.");
      });


      it('should be thrown when first parameter is not present', function() {
        expect(function() {
          inbox.namespace(28);
        }).toThrow("Unable to perform 'namespace()' on InboxAPI: namespaceId must be a string.");
      });
    });
  });
});
