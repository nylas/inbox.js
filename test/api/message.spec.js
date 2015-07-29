describe('INMessage', function() {
  var haveOwnPromise = window.hasOwnProperty('Promise');
  var inbox;
  var thread;
  var server;

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.nylas.com/'
    });
    thread = new INThread(inbox, {
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
          'id': 'f0idlvozkrpj3ihxze7obpivh',
          'object': 'tag'
        },
        {
          'name': 'unread',
          'id': '8keda28h8ijj2nogpj83yjep8',
          'object': 'tag'
        }
      ],
      'message_ids': [
        '251r594smznew6yhiocht2v29',
        '7upzl8ss738iz8xf48lm84q3e',
        'ah5wuphj3t83j260jqucm9a28'
      ],
      'draft_ids': []
    });
  });


  afterEach(function() {
    server.restore();
    if (haveOwnPromise) {
      window.Promise = mockPromises.getOriginalPromise();
    } else {
      delete window.Promise;
    }
    thread = null;
  });


  var mockMsg1 = {
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

  var mappedMsg1 = {
    'id': '84umizq7c4jtrew491brpa6iu',
    'namespaceId': 'fake_namespace_id',
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
    'date': new Date(1370084645000),
    'threadId': '5vryyrki4fqt7am31uso27t3f',
    'fileData': [
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

  var mockMsg1Updated = __extend(__extend({}, mockMsg1), {
    'unread': false
  });

  var mappedMsg1Updated = __extend(__extend({}, mappedMsg1), {
    'unread': false
  });

  describe ('via INThread#messages()', function() {
    // Messages should be immutable, so this should never matter in practice, but it's theoretically
    // possible to protect against properties being overwritten on the client-side. However, there's
    // no real reason for this.
    it('should update messages consistent with resourceMapping', function() {
      var oldMsgs = [new INMessage(inbox, mockMsg1)];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(msg) {
        expect(msg[0]).toContainObject(mappedMsg1Updated);
        expect(msg[0].fileData.length).toBe(1);
        expect(msg[0].files).toBeUndefined();
      });
      var promise = thread.messages(oldMsgs).then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify([mockMsg1Updated])]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });

  describe('resourceUrl()', function() {
    it ('should be null if the model is unsynced', function() {
      expect ((new INMessage(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should have resourceUrl() like <baseUrl>/n/<namespaceId>/messages/<messageId>', function() {
      expect ((new INMessage(namespace, mockMsg1)).resourceUrl()).toBe('http://api.nylas.com/n/fake_namespace_id/messages/84umizq7c4jtrew491brpa6iu');
    });
  });

  describe('thread()', function() {
    it('should return an INThread instance with the correct namespace and ID', function(){
      var msg = new INMessage(inbox, mockMsg1);
      var thread = msg.thread();
      expect(thread instanceof INThread).toBe(true);
      expect(thread.id).toBe(msg.threadId);
      expect(thread.namespaceId).toBe(msg.namespaceId);
    })
  });

  describe('attachments()', function() {
    it('should return an array of populated INFiles', function() {
      var msg = new INMessage(inbox, mockMsg1);
      expect(msg.attachments().length).toBe(1);
      expect(msg.attachments()[0] instanceof INFile).toBe(true);
      expect(msg.attachments()[0].id).toBe(mockMsg1.files[0].id);
    });
  });

  describe('attachment()', function() {
    it ('should accept an index', function () {
      var msg = new INMessage(inbox, mockMsg1);
      var a = msg.attachment(0);
      expect(a instanceof INFile).toBe(true);
      expect(a.id).toBe(mockMsg1.files[0].id);
    });

    it ('should accept an ID', function () {
      var msg = new INMessage(inbox, mockMsg1);
      var a = msg.attachment(mockMsg1.files[0].id);
      expect(a instanceof INFile).toBe(true);
      expect(a.id).toBe(mockMsg1.files[0].id);
    });

    it ('should return null if the ID DNE or index is out of bounds', function () {
      var msg = new INMessage(inbox, mockMsg1);
      expect(msg.attachment('lololol')).toBe(null);
      expect(msg.attachment(12)).toBe(null);
    });
  })
});
