describe('INTag', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;
  var namespace;

  var mockNamespace = {
    'account': 'fake_account_id',
    'email_address': 'fake.email@nylas.com',
    'id': 'fake_namespace_id',
    'namespace_id': 'fake_namespace_id',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mockTag1 = {
    'id': '84umizq7c4jtrew491brpa6iu',
    'name': 'sports',
    'namespace_id': 'fake_namespace_id',
    'object': 'tag'
  };

  var mappedTag1 = {
    'id': '84umizq7c4jtrew491brpa6iu',
    'tagName': 'sports',
    'namespaceId': 'fake_namespace_id',
    'object': 'tag'
  };

  var mockTag2 = {
    'id': 'unread',
    'name': 'unread',
    'namespace_id': 'fake_namespace_id',
    'object': 'tag'
  };

  var mappedTag2 = {
    'id': 'unread',
    'tagName': 'unread',
    'namespaceId': 'fake_namespace_id',
    'object': 'tag'
  };

  var mockTags = [
    mockTag1,
    mockTag2
  ];

  var mockNotFound = {
    'message': '404: Not Found',
    'type': 'api_error'
  };

  var mockThread1 = {
    'id': 'fake_thread_id1',
    'object': 'thread',
    'namespace_id': 'fake_namespace_id',
    'subject': 'Mock Thread 1',
    'last_message_timestamp': 1398229259,
    'participants': [
      {
        'name': 'Ben Bitdiddle',
        'email': 'ben.bitdiddle@gmail.com'
      },
      {
        'name': 'Bill Rogers',
        'email': 'wrogers@mit.edu'
      }
    ],
    'snippet': 'Test thread 1...',
    'tags': [
      {
        'name': 'inbox',
        'id': 'inbox'
      },
      {
        'name': 'unread',
        'id': 'unread'
      }
    ],
    'message_ids': [
      '251r594smznew6yhiocht2v29',
      '7upzl8ss738iz8xf48lm84q3e',
      'ah5wuphj3t83j260jqucm9a28'
    ],
    'draft_ids': []
  };

  var mockThread2 = {
    'id': 'fake_thread_id2',
    'object': 'thread',
    'namespace_id': 'fake_namespace_id',
    'subject': 'Mock Thread 2',
    'last_message_timestamp': 1399238467,
    'participants': [
      {
        'name': 'Ben Bitdiddle',
        'email': 'ben.bitdiddle@gmail.com'
      },
      {
        'name': 'Bill Rogers',
        'email': 'wrogers@mit.edu'
      }
    ],
    'snippet': 'Test thread 2...',
    'tags': [
      {
        'name': 'unread',
        'id': 'unread'
      }
    ],
    'message_ids': [
      '251r594smznew6yhiocht2v29',
      '7upzl8ss738iz8xf48lm84q3e'
    ],
    'draft_ids': []
  };
  var mockThreads = [
    mockThread1,
    mockThread2
  ];

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.nylas.com/'
    });
    namespace = new INNamespace(inbox, mockNamespace);
  });


  afterEach(function() {
    server.restore();
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
  });


  describe('INNamespace#tags()', function() {
    it('should resolve promise with an Array of INTags', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(tags) {
        expect(tags.length).toBe(2);
        expect(tags[0] instanceof INTag).toBe(true);
        expect(tags[1] instanceof INTag).toBe(true);
      });
      var promise = namespace.tags().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockTags)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into resources', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(tags) {
        expect(tags[0]).toContainObject(mappedTag1);
        expect(tags[1]).toContainObject(mappedTag2);
      });
      var promise = namespace.tags().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockTags)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = namespace.tags();
      server.respond([404, { 'Content-Type': 'application/json' }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    it('should update passed array of tags', function() {
      var oldTags = [new INTag(inbox, mockTag1)];
      var newTag = new INTag(inbox, mockTag2);

      var fulfilled = jasmine.createSpy('load').andCallFake(function(tags) {
        expect(tags.length).toBe(2);
        expect(tags).toBe(oldTags);
        expect(tags[0]).toBe(oldTags[0]);

        expect(tags[1].id).toBe(newTag.id);
        expect(tags[1]).toContainObject(newTag);
        expect(tags[1] instanceof INTag).toBe(true);
      });
      var promise = namespace.tags(oldTags).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockTags)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('INTag#threads()', function() {
    var tag;
    beforeEach(function() {
      tag = new INTag(namespace, mockTag2);
    });


    afterEach(function() {
      tag = null;
    });


    it('should call INNamespace#threads() filtered by tagId', function() {
      var threads = INNamespace.prototype.threads;
      spyOn(INNamespace.prototype, 'threads').andCallFake(function(update, filters) {
        expect(typeof filters).toBe('object');
        expect(filters.tag).toBe('unread');
        return threads.call(this, update, filters);
      });
      var fulfilled = jasmine.createSpy('load');
      var promise = tag.threads().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
      expect(INNamespace.prototype.threads).toHaveBeenCalled();
      INNamespace.prototype.threads = threads;
    });


    it('should override tag filter', function() {
      var threads = INNamespace.prototype.threads;
      spyOn(INNamespace.prototype, 'threads').andCallFake(function(update, filters) {
        expect(typeof filters).toBe('object');
        expect(filters.tag).toBe('unread');
        return threads.call(this, update, filters);
      });
      var fulfilled = jasmine.createSpy('load');
      var promise = tag.threads({
        tag: 'notarealtag'
      }).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
      expect(INNamespace.prototype.threads).toHaveBeenCalled();
      INNamespace.prototype.threads = threads;
    });
  });


  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INTag(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should have resourceUrl() like <baseUrl>/n/<namespaceId>/tags/<filesId>', function() {
      expect ((new INTag(namespace, mockTag1)).resourceUrl()).toBe('http://api.nylas.com/n/fake_namespace_id/tags/84umizq7c4jtrew491brpa6iu');
    });
  });

});
