describe('INThread', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;
  var namespace;

  var mockNotFound;
  var mockNamespace;
  var mockThread1;
  var mappedThread1;
  var mockThread1Updated;
  var mappedThread1Updated;
  var mockThread1TagAdded;
  var mockThread1TagRemoved;
  var mockThread1TagAddedRemoved;
  var mockThread1Updated2;
  var mappedThread1Updated2;
  var mockThread2;
  var mappedThread2;
  var mockThreads;

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
    });
    namespace = new INNamespace(inbox, mockNamespace);

    mockNotFound = {
      'message': '404: Not Found',
      'type': 'api_error'
    };

    mockNamespace = {
      'account': 'fake_account_id',
      'email_address': 'fake.email@inboxapp.co',
      'id': 'fake_namespace_id',
      'namespace': 'fake_namespace_id',
      'object': 'namespace',
      'provider': 'FakeProvider'
    };

    mockThread1 = {
      'id': 'fake_thread_id1',
      'object': 'thread',
      'namespace': 'fake_namespace_id',
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
          'id': 'f0idlvozkrpj3ihxze7obpivh',
          'object': 'tag'
        },
        {
          'name': 'unread',
          'id': '8keda28h8ijj2nogpj83yjep8',
          'object': 'tag'
        }
      ],
      'messages': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e',
        'ah5wuphj3t83j260jqucm9a28'
      ],
      'drafts': []
    };

    mappedThread1 = {
      'id': 'fake_thread_id1',
      'object': 'thread',
      'namespaceID': 'fake_namespace_id',
      'subject': 'Mock Thread 1',
      'lastMessageDate': new Date(1398229259000),
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
      'tagData': [
        {
          'name': 'inbox',
          'id': 'f0idlvozkrpj3ihxze7obpivh',
          'object': 'tag'
        },
        {
          'name': 'unread',
          'id': '8keda28h8ijj2nogpj83yjep8',
          'object': 'tag'
        }
      ],
      'messageIDs': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e',
        'ah5wuphj3t83j260jqucm9a28'
      ],
      'draftIDs': []
    };

    mockThread1Updated = __extend(mockThread1, {
      'messages': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e',
        'ah5wuphj3t83j260jqucm9a28',
        'ag9afs86as9g8gasfasfsaf98'
      ]
    });

    mappedThread1Updated = __extend(mappedThread1, {
      'messageIDs': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e',
        'ah5wuphj3t83j260jqucm9a28',
        'ag9afs86as9g8gasfasfsaf98'
      ]
    });

    mockThread1TagAdded = __extend(mockThread1, {
      'tags': [
        {
          'name': 'inbox',
          'id': 'f0idlvozkrpj3ihxze7obpivh',
          'object': 'tag'
        },
        {
          'name': 'unread',
          'id': '8keda28h8ijj2nogpj83yjep8',
          'object': 'tag'
        },
        {
          'name': 'zing',
          'id': '5235235142asasdasfasfafa1',
          'object': 'tag'
        }
      ],
    });

    mockThread1TagRemoved = __extend({}, mockThread1);
    mockThread1TagRemoved.tags = [
      {
        'name': 'unread',
        'id': '8keda28h8ijj2nogpj83yjep8',
        'object': 'tag'
      }
    ];

    mockThread1TagAddedRemoved = __extend(mockThread1, {
      'tags': [
        {
          'name': 'unread',
          'id': '8keda28h8ijj2nogpj83yjep8',
          'object': 'tag'
        },
        {
          'name': 'zing',
          'id': '5235235142asasdasfasfafa1',
          'object': 'tag'
        }
      ]
    });

    mockThread1Updated2 = __extend({}, mockThread1);
    mockThread1Updated2.messages = [
      'ag9afs86as9g8gasfasfsaf98'
    ];

    mappedThread1Updated2 = __extend({}, mappedThread1);
    mappedThread1Updated2.messageIDs = [
      'ag9afs86as9g8gasfasfsaf98'
    ];

    mockThread2 = {
      'id': 'fake_thread_id2',
      'object': 'thread',
      'namespace': 'fake_namespace_id',
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
          'name': 'inbox',
          'id': 'f0idlvozkrpj3ihxze7obpivh'
        }
      ],
      'messages': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e'
      ],
      'drafts': []
    };

    mappedThread2 = {
      'id': 'fake_thread_id2',
      'object': 'thread',
      'namespaceID': 'fake_namespace_id',
      'subject': 'Mock Thread 2',
      'lastMessageDate': new Date(1399238467000),
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
      'tagData': [
        {
          'name': 'inbox',
          'id': 'f0idlvozkrpj3ihxze7obpivh'
        }
      ],
      'messageIDs': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e'
      ],
      'draftIDs': []
    };

    mockThreads = [
      mockThread1,
      mockThread2
    ];
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
    expect(new INThread() instanceof INModelObject).toBe(true);
  });


  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INThread(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should have resourceUrl() like <baseUrl>/n/<namespaceId>/threads/<threadId>', function() {
      expect ((new INThread(namespace, mockThread1)).resourceUrl()).toBe('http://api.inboxapp.co/n/fake_namespace_id/threads/fake_thread_id1');
    });
  });

  describe('INNamespace#threads()', function() {
    it('should resolve promise with an Array of INThreads', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads.length).toBe(2);
        expect(threads[0] instanceof INThread).toBe(true);
        expect(threads[1] instanceof INThread).toBe(true);
      });
      var promise = namespace.threads().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into resources', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads[0]).toContainObject(mappedThread1);
        //expect(threads[1]).toContainObject(mappedThread2);
      });
      var promise = namespace.threads().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = namespace.threads();
      server.respond([404, { 'Content-Type': 'application/json' }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    it('should update passed array of threads', function() {
      var oldThreads = [mockThread1];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads.length).toBe(2);
        expect(threads).toBe(oldThreads);
        expect(threads[0]).toBe(oldThreads[0]);
        expect(threads[1]).toContainObject(mappedThread2);
        expect(threads[1] instanceof INThread).toBe(true);
      });
      var promise = namespace.threads(oldThreads).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should update threads consistent with resourceMapping (issue #30)', function() {
      var oldThreads = [new INThread(inbox, mockThread1)];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads[0]).toContainObject(mappedThread1Updated2);
      });
      var promise = namespace.threads(oldThreads).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify([mockThread1Updated2])]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('INNamespace#thread()', function() {
    it('should resolve promise with INThread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(thread) {
        expect(thread instanceof INThread).toBe(true);
      });
      var promise = namespace.thread('fake_thread_1').then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy mapped property values into new resource', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(thread) {
        expect(thread).toContainObject(mappedThread2);
      });
      var promise = namespace.thread('fake_thread_2').then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread2)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = namespace.thread('124124124123');
      server.respond([404, { 'Content-Type': 'application/json' }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });
  });


  describe('reload method', function() {
    var thread;
    beforeEach(function() {
      thread = new INThread(namespace, mockThread1);
    });


    it('should resolve with original Thread object', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toBe(thread);
      });
      var promise = thread.reload().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve including properties from original Thread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toContainObject(mappedThread1Updated);
      });
      var promise = thread.reload().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve including properties from updated Thread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toContainObject(mappedThread1Updated);
        expect(newThread.messageIDs.length).toBe(4);
        expect(newThread.messageIDs[3]).toBe('ag9afs86as9g8gasfasfsaf98');
      });
      var promise = thread.reload().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve removing properties deleted in updated Thread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toContainObject(mappedThread1Updated2);
        expect(newThread.messageIDs.length).toBe(1);
        expect(newThread.messageIDs[0]).toBe('ag9afs86as9g8gasfasfsaf98');
      });
      var promise = thread.reload().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1Updated2)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('updateTags()', function() {
    var thread;
    beforeEach(function() {
      thread = new INThread(namespace, mockThread1);
    });

    it('should resolve promise with updated Thread after updating tags', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread.tagData.length).toBe(2);
        expect(newThread.tagData[0].name).toBe('unread');
        expect(newThread.tagData[1].name).toBe('zing');
      });
      var promise = thread.updateTags(['zing'], ['inbox']).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1TagAddedRemoved)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve promise with updated Thread after adding tags', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread.tagData.length).toBe(3);
        expect(newThread.tagData[0].name).toBe('inbox');
        expect(newThread.tagData[1].name).toBe('unread');
        expect(newThread.tagData[2].name).toBe('zing');
      });
      var promise = thread.updateTags(['zing']).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1TagAdded)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve promise with updated Thread after removing tags', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread.tagData.length).toBe(1);
        expect(newThread.tagData[0].name).toBe('unread');
      });
      var promise = thread.updateTags(['zing']).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify(mockThread1TagRemoved)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should perform work for INThread#addTags()', function() {
      var orig = INThread.prototype.updateTags;
      var spy = spyOn(INThread.prototype, 'updateTags').
      andCallFake(function(addTags, removeTags) {
        expect(addTags).toContainObject(['foo', 'bar']);
        expect(removeTags).toBe(null);
      });
      thread.addTags(['foo', 'bar']);
      expect(spy).toHaveBeenCalledOnce();
      INThread.prototype.updateTags = orig;
    });


    it('should perform work for INThread#removeTags()', function() {
      var orig = INThread.prototype.updateTags;
      var spy = spyOn(INThread.prototype, 'updateTags').
      andCallFake(function(addTags, removeTags) {
        expect(addTags).toBe(null);
        expect(removeTags).toContainObject(['foo', 'bar']);
      });
      thread.removeTags(['foo', 'bar']);
      expect(spy).toHaveBeenCalledOnce();
      INThread.prototype.updateTags = orig;
    });
  });


  describe('hasTag()', function() {
    it('should return true if the tag name is found', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.hasTag('inbox')).toBe(true);
    });


    it('should return false if the tag name is not found', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.hasTag('gerbil')).toBe(false);
    });


    it('should search in a case-sensitive fashion', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.hasTag('InBoX')).toBe(false);
    });
  });

  describe('reply()', function() {
    it('should return an instance of INDraft', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.reply() instanceof INDraft).toBe(true);
    });

    it('should populate draft.thread_id', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.reply().thread().id).toBe(thread.id);
    });

    it('should populate draft.subject with the thread subject', function() {
      var thread = new INThread(namespace, mockThread1);
      expect(thread.reply().subject).toBe(thread.subject);
    });
  });

});
