describe('InboxThread', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var server;
  var namespace;

  var mockNotFound = {
    "message": "404: Not Found",
    "type": "api_error"
  };

  var mockNamespace = {
    "account": "fake_account_id",
    "email_address": "fake.email@inboxapp.co",
    "id": "fake_namespace_id",
    "namespace": "fake_namespace_id",
    "object": "namespace",
    "provider": "FakeProvider"
  };

  var mockThread1 = {
    "id": "fake_thread_id1",
    "object": "thread",
    "namespace": "fake_namespace_id",
    "subject": "Mock Thread 1",
    "last_message_timestamp": 1398229259,
    "participants": [
      {
        "name": "Ben Bitdiddle",
        "email": "ben.bitdiddle@gmail.com"
      },
      {
        "name": "Bill Rogers",
        "email": "wrogers@mit.edu"
      }
    ],
    "snippet": "Test thread 1...",
    "tags": [
      {
        "name": "inbox",
        "id": "f0idlvozkrpj3ihxze7obpivh",
        "object": "tag"
      },
      {
        "name": "unread",
        "id": "8keda28h8ijj2nogpj83yjep8",
        "object": "tag"
      }
    ],
    "messages": [
      "251r594smznew6yhiocht2v29",
      "7upzl8ss738iz8xf48lm84q3e",
      "ah5wuphj3t83j260jqucm9a28"
    ],
    "drafts": []
  };

  var mockThread1Updated = __extend(mockThread1, {
    "messages": [
      "251r594smznew6yhiocht2v29",
      "7upzl8ss738iz8xf48lm84q3e",
      "ah5wuphj3t83j260jqucm9a28",
      "ag9afs86as9g8gasfasfsaf98"
    ]
  });

  var mockThread2 = {
    "id": "fake_thread_id2",
    "object": "thread",
    "namespace": "fake_namespace_id",
    "subject": "Mock Thread 2",
    "last_message_timestamp": 1399238467,
    "participants": [
      {
        "name": "Ben Bitdiddle",
        "email": "ben.bitdiddle@gmail.com"
      },
      {
        "name": "Bill Rogers",
        "email": "wrogers@mit.edu"
      }
    ],
    "snippet": "Test thread 2...",
    "tags": [
      {
        "name": "inbox",
        "id": "f0idlvozkrpj3ihxze7obpivh"
      }
    ],
    "messages": [
      "251r594smznew6yhiocht2v29",
      "7upzl8ss738iz8xf48lm84q3e"
    ],
    "drafts": []
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
      baseUrl: 'http://api.inboxapp.co/'
    });
    namespace = new InboxNamespace(inbox, mockNamespace);
  });


  afterEach(function() {
    server.restore();
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
  });


  describe('InboxNamespace#threads()', function() {
    it('should resolve promise with an Array of InboxThreads', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads.length).toBe(2);
        expect(threads[0] instanceof InboxThread).toBe(true);
        expect(threads[1] instanceof InboxThread).toBe(true);
      });
      var promise = namespace.threads().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy properties from each thread object into new InboxThread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads[0]).toContainObject(mockThread1);
        expect(threads[1]).toContainObject(mockThread2);
      });
      var promise = namespace.threads().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should include threadUrl in InboxThread private properties', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads[0]._.threadUrl).
          toBe('http://api.inboxapp.co/n/fake_namespace_id/threads/fake_thread_id1');
        expect(threads[1]._.threadUrl).
          toBe('http://api.inboxapp.co/n/fake_namespace_id/threads/fake_thread_id2');
      });
      var promise = namespace.threads().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = namespace.threads();
      server.respond([404, { "Content-Type": "application/json" }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });


    it('should update passed array of namespaces', function() {
      var oldThreads = [mockThread1];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(threads) {
        expect(threads.length).toBe(2);
        expect(threads).toBe(oldThreads);
        expect(threads[0]).toBe(oldThreads[0]);
        expect(threads[1]).toContainObject(mockThread2);
        expect(threads[1] instanceof InboxThread).toBe(true);
      });
      var promise = namespace.threads(oldThreads).then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThreads)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });


  describe('InboxNamespace#thread()', function() {
    it('should resolve promise with InboxThread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(thread) {
        expect(thread instanceof InboxThread).toBe(true);
      });
      var promise = namespace.thread('fake_thread_1').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread1)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should copy properties from thread object into new InboxThread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(thread) {
        expect(thread).toContainObject(mockThread2);
      });
      var promise = namespace.thread('fake_thread_2').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread2)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should include threadUrl in InboxThread private properties', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(thread) {
        expect(thread._.threadUrl).
          toBe('http://api.inboxapp.co/n/fake_namespace_id/threads/fake_thread_id1');
      });
      var promise = namespace.thread('fake_thread_id1').then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread1)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should not resolve promise on error status', function() {
      var promise = namespace.thread('124124124123');
      server.respond([404, { "Content-Type": "application/json" }, JSON.stringify(mockNotFound)]);
      mockPromises.executeForPromise(promise);
      expect(promise.isFulfilled()).not.toBe(true);
      expect(promise.isRejected()).toBe(true);
    });
  });


  describe('sync method', function() {
    var thread;
    beforeEach(function() {
      thread = new InboxThread(namespace, mockThread1);
    });


    it('should resolve with original Thread object', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toBe(thread);
      });
      var promise = thread.sync().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve including properties from original Thread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toContainObject(mockThread1);
      });
      var promise = thread.sync().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });


    it('should resolve including properties from updated Thread', function() {
      var fulfilled = jasmine.createSpy('load').andCallFake(function(newThread) {
        expect(newThread).toContainObject(mockThread1Updated);
        expect(newThread.messages[3]).toBe('ag9afs86as9g8gasfasfsaf98');
      });
      var promise = thread.sync().then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify(mockThread1Updated)]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });
});
