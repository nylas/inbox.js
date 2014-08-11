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
      baseUrl: 'http://api.inboxapp.co/'
    });
    thread = new INThread(inbox, {
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
    "id": "84umizq7c4jtrew491brpa6iu",
    "object": "message",
    "subject": "Re: Dinner on Friday?",
    "from": [
      {
        "name": "Ben Bitdiddle",
        "email": "ben.bitdiddle@gmail.com"
      }
    ],
    "to": [
      {
        "name": "Bill Rogers",
        "email": "wbrogers@mit.edu"
      }
    ],
    "cc": [],
    "bcc": [],
    "date": 1370084645,
    "thread": "5vryyrki4fqt7am31uso27t3f",
    "files": [
        {
            "content_type": "image/jpeg",
            "filename": "walter.jpg",
            "id": "7jm8bplrg5tx0c7pon56tx30r",
            "size": 38633
        }
    ],
    "body": "<html><body>....</body></html>",
    "unread": true
  };

  var mappedMsg1 = {
    "id": "84umizq7c4jtrew491brpa6iu",
    "object": "message",
    "subject": "Re: Dinner on Friday?",
    "from": [
      {
        "name": "Ben Bitdiddle",
        "email": "ben.bitdiddle@gmail.com"
      }
    ],
    "to": [
      {
        "name": "Bill Rogers",
        "email": "wbrogers@mit.edu"
      }
    ],
    "cc": [],
    "bcc": [],
    "date": new Date(1370084645000),
    "threadID": "5vryyrki4fqt7am31uso27t3f",
    "attachmentData": [
      {
        "content_type": "image/jpeg",
        "filename": "walter.jpg",
        "id": "7jm8bplrg5tx0c7pon56tx30r",
        "size": 38633
      }
    ],
    "body": "<html><body>....</body></html>",
    "unread": true
  };

  var mockMsg1Updated = __extend(__extend({}, mockMsg1), {
    "unread": false
  });

  var mappedMsg1Updated = __extend(__extend({}, mappedMsg1), {
    "unread": false
  });

  describe ('via INThread#messages()', function() {
    // Messages should be immutable, so this should never matter in practice, but it's theoretically
    // possible to protect against properties being overwritten on the client-side. However, there's
    // no real reason for this.
    it('should update messages consistent with resourceMapping', function() {
      var oldMsgs = [new INMessage(inbox, mockMsg1)];
      var fulfilled = jasmine.createSpy('load').andCallFake(function(msg) {
        expect(msg[0]).toContainObject(mappedMsg1Updated);
        expect(msg[0].attachments().length).toBe(1);
        expect(msg[0].files).toBeUndefined();
      });
      var promise = thread.messages(oldMsgs).then(fulfilled);
      server.respond([200, { "Content-Type": "application/json" }, JSON.stringify([mockMsg1Updated])]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });
});
