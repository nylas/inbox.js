describe('InboxNamespace', function() {
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

  var mockNotFound = {
    "message": "Couldn't find namespace with id `not_found_namespace_id` ",
    "type": "invalid_request_error"
  };

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      baseUrl: 'http://api.inboxapp.co/n/'
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


  describe('InboxAPI#namespace()', function() {
    it('should resolve promise with an instance of InboxNamespace', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace instanceof InboxNamespace).toBe(true);
      });
      var promise = inbox.namespace('fake_namespace_id').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockNamespace)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy properties from JSON response object into new InboxNamespace', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace).toContainObject(mockNamespace);
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
        }).toThrow("Unable to perform 'namespace()' on InboxAPI: missing option `namespaceId`");
      });


      it('should be thrown when first parameter is not present', function() {
        expect(function() {
          inbox.namespace(28);
        }).toThrow("Unable to perform 'namespace()' on InboxAPI: namespaceId must be a string");
      });
    });
  });
});
