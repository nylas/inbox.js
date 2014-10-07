describe('INNamespace', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;

  var mockNamespace = {
    'account': 'fake_account_id',
    'email_address': 'fake.email@inboxapp.co',
    'id': 'fake_namespace_id',
    'namespace_id': 'fake_namespace_id',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mappedNamespace = {
    'account': 'fake_account_id',
    'emailAddress': 'fake.email@inboxapp.co',
    'id': 'fake_namespace_id',
    'namespaceId': 'fake_namespace_id',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mockNamespace2 = {
    'account': 'fake_account_id_2',
    'email_address': 'fake.email_2@inboxapp.co',
    'id': 'fake_namespace_id_2',
    'namespace_id': 'fake_namespace_id_2',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mappedNamespace2 = {
    'account': 'fake_account_id_2',
    'emailAddress': 'fake.email_2@inboxapp.co',
    'id': 'fake_namespace_id_2',
    'namespaceId': 'fake_namespace_id_2',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mockNamespaces = [
    mockNamespace,
    mockNamespace2
  ];

  var mockFile = [{
    'content_type': 'text/plain',
    'id': '3f7d6reg1k7hc2umqkz8gcfmo',
    'namespace_id': 'fake_namespace_id',
    'object': 'file',
    'size': 9
  }];

  var mappedFile = [{
    'contentType': 'text/plain',
    'id': '3f7d6reg1k7hc2umqkz8gcfmo',
    'namespaceId': 'fake_namespace_id',
    'object': 'file',
    'size': 9
  }];

  var mockNotFound = {
    'message': 'Couldn`t find namespace with id `not_found_namespace_id` ',
    'type': 'invalid_request_error'
  };

  var mockDraft = {
    'id': '84umizq7c4jtrew491brpa6iu',
    'namespace_id': 'fake_namespace_id',
    'object': 'message',
    'subject': 'Re: Dinner on Friday?',
    'from': [
      {
        'name': 'Ben Bitdiddle',
        'email': 'ben.bitdiddle@gmail.com'
      }
    ],
    'to': [
      {
        'name': 'Bill Rogers',
        'email': 'wbrogers@mit.edu'
      }
    ],
    'cc': [],
    'bcc': [],
    'date': 1370084645,
    'thread_id': '5vryyrki4fqt7am31uso27t3f',
    'files': [
      {
        'content_type': 'image/jpeg',
        'filename': 'walter.jpg',
        'id': '7jm8bplrg5tx0c7pon56tx30r',
        'size': 38633
      }
    ],
    'body': '<html><body>....</body></html>',
    'unread': true
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


  it('should have correct IDs', function() {
    var namespace = new INNamespace(inbox, 'fake_id');
    expect(namespace.id).toBe('fake_id');
    expect(namespace.namespaceId).toBe('fake_id');

    var namespace = new INNamespace(inbox, {'namespace_id': 'fake_id', 'id': 'fake_id'});
    expect(namespace.id).toBe('fake_id');
    expect(namespace.namespaceId).toBe('fake_id');
  });


  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INNamespace(inbox)).resourceUrl()).toBe(null);
    });

    it('should have resourceUrl() like <baseUrl>/n/<namespaceId>', function() {
      expect ((new INNamespace(inbox, 'fake_id')).resourceUrl()).toBe('http://api.inboxapp.co/n/fake_id');
    });
  });


  describe('InboxAPI#namespaces()', function() {
    it('should be a method of InboxAPI', function() {
      expect(typeof inbox.namespaces).toBe('function');
    });


    it('should resolve promise with an array of INNamespaces', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespaces) {
        expect(namespaces.length).toBe(2);
        expect(namespaces[0] instanceof INNamespace).toBe(true);
        expect(namespaces[1] instanceof INNamespace).toBe(true);
      });
      var promise = inbox.namespaces().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into resources', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespaces) {
        expect(namespaces[0]).toContainObject(mappedNamespace);
        expect(namespaces[1]).toContainObject(mappedNamespace2);
      });
      var promise = inbox.namespaces().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = inbox.namespaces();
      server.respond([404, { 'Content-Type': 'application/json' }, JSON.stringify(mockNotFound)]);
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
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockNamespaces)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('InboxAPI#namespace()', function() {
    it('should resolve promise with an instance of INNamespace', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace instanceof INNamespace).toBe(true);
      });
      var promise = inbox.namespace('fake_namespace_id').then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockNamespace)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into new resource', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(namespace) {
        expect(namespace).toContainObject(mappedNamespace);
      });
      var promise = inbox.namespace('fake_namespace_id').then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockNamespace)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = inbox.namespace('not_found_namespace_id');
      server.respond([401, { 'Content-Type': 'application/json' }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    describe('errors', function() {
      it('should be thrown when first parameter is not present', function() {
        expect(function() {
          inbox.namespace();
        }).toThrow('Unable to perform `namespace()` on InboxAPI: missing option `namespaceId`.');
      });


      it('should be thrown when first parameter is not present', function() {
        expect(function() {
          inbox.namespace(28);
        }).toThrow('Unable to perform `namespace()` on InboxAPI: namespaceId must be a string.');
      });
    });
  });


  describe('uploadFile()', function() {
    it('should resolve promise with a single INFile', function() {
      if (!window.Blob) return;
      var namespace = new INNamespace(inbox, mockNamespace);
      var fulfilled = jasmine.createSpy('load').andCallFake(function(file) {
        expect(file instanceof INFile).toBe(true);
        expect(file).toContainObject(mappedFile[0]);
      });
      var blob = new Blob(['Fake File'], { type: 'text/plain' });
      var promise = namespace.uploadFile('fake_file.txt', blob).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockFile)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });

  describe('draft()', function () {
    it('should return an empty draft by default', function (){
      var draft = new INNamespace(inbox, mockNamespace).draft();
      expect(draft instanceof INDraft).toBe(true);
    });

    it('should return a promise if called with an ID argument', function () {
      var draft = new INNamespace(inbox, mockNamespace).draft("some_id");
      expect(typeof(draft)).toBe('object');
      expect(draft.then).toBeDefined();
    });

    it('should throw if passed a non-string argument', function () {
      var f = function () {
        new INNamespace(inbox, mockNamespace).draft({})
      }
      expect(f).toThrow();
    });

    it('should return an INDraft object if one is found', function () {
      var draft;
      var fulfilled = jasmine.createSpy('load').andCallFake(function (draft) {
        expect(draft).toBeDefined();
        expect(draft.id).toEqual(mockDraft.id);
        expect(draft instanceof INDraft);
      });
      var promise = new INNamespace(inbox, mockNamespace).draft(mockDraft.id).then(fulfilled)
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockDraft)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });

    it('should return an error if none is found', function () {
      var errored = jasmine.createSpy('error').andCallFake(function (error) {});
      var promise = new INNamespace(inbox, mockNamespace).draft(mockDraft.id).then(function() {}, errored);
      server.respond([404, { 'Content-Type': 'application/json' }, JSON.stringify("arbitrary error data")]);
      mockPromises.executeForPromise(promise);
      expect(errored).toHaveBeenCalled();
    })
  });
});
