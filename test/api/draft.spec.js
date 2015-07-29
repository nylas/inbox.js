describe('INDraft', function() {
  var inbox;
  var mockNamespace;
  var mockDraft1;
  var mappedDraft1;

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.nylas.com/'
    });
    namespace = new INNamespace(inbox, mockNamespace);
    
    mockNamespace = {
      'account': 'fake_account_id',
      'email_address': 'fake.email@nylas.com',
      'id': 'fake_namespace_id',
      'object': 'namespace',
      'provider': 'FakeProvider'
    };

    mockDraft1 = {
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

    mappedDraft1 = {
      'id': '84umizq7c4jtrew491brpa6iu',
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

  });

  it('should be a child class of INMessage', function() {
    expect(new INDraft() instanceof INMessage).toBe(true);
  });


  describe('INThread#drafts()', function() {
    // TODO:
    // Implement tests for INThread#drafts().
    //
    // These should be similar to tests for INThread#messages().
  });


  describe('resourceUrl()', function() {
    it ('should be null if the model is  unsynced', function() {
      expect ((new INDraft(inbox, null, 'fake_namespace_id')).resourceUrl()).toBe(null);
    });

    it('should have resourceUrl() like <baseUrl>/n/<namespaceId>/drafts/<threadId>', function() {
      expect ((new INDraft(namespace, mockDraft1)).resourceUrl()).toBe('http://api.nylas.com/n/fake_namespace_id/drafts/84umizq7c4jtrew491brpa6iu');
    });
  });

  describe('dispose()', function() {
    it ('should locally delete the model', function() {
      var draft = new INDraft(namespace, mockDraft1);
      spyOn(window, 'deleteModel');
      var promise = draft.dispose();
      mockPromises.executeForPromise(promise);
      expect(window.deleteModel).toHaveBeenCalled();
    });

    it ('should make a deletion API request if the model is synced', function() {
      var draft = new INDraft(namespace, mockDraft1);
      spyOn(window, 'apiRequest');
      var promise = draft.dispose();
      mockPromises.executeForPromise(promise);
      expect(window.apiRequest).toHaveBeenCalled();
    });

    it ('should NOT make a deletion API request if the model is NOT synced', function() {
      var draft = new INDraft(namespace, null);
      spyOn(window, 'apiRequest');
      var promise = draft.dispose();
      mockPromises.executeForPromise(promise);
      expect(window.apiRequest).not.toHaveBeenCalled();
    });

    it ('should return a promise that resolves with the draft object', function() {
      var draft = new INDraft(namespace, mockDraft1);
      var fulfilled = jasmine.createSpy('deleted').andCallFake(function(obj) {
        expect(obj instanceof INDraft).toBe(true);
      });
      var promise = draft.dispose().then(fulfilled);
      server.respond([200, { 'Content-Type': 'application/json' }, JSON.stringify({'success': true})]);
      mockPromises.executeForPromise(promise);
      expect(fulfilled).toHaveBeenCalled();
    });
  });

  describe ('save()', function() {
    // Messages should be immutable, so this should never matter in practice, but it's theoretically
    // possible to protect against properties being overwritten on the client-side. However, there's
    // no real reason for this.
    it('should throw an exception if the to, cc, or bcc fields are not properly formatted', function() {
      var data = {
        'namespace_id': 'fake_namespace_id',
        'to': [{'name': 'Ben', 'email':'ben@nylas.com'}],
        'cc': [{'name': 'Michael', 'email':'mg@nylas.com'}],
        'bcc': [{'name': 'Spang', 'email':'spang@nylas.com'}],
        'subject': 'My New Draft'
      };

      var keys = ['to', 'cc', 'bcc'];
      for (var ii = 0; ii < keys.length; ii ++) {
        var key = keys[ii];
        var draft = new INDraft(inbox, data);

        // valid
        expect(function() {
          draft.save();
        }).not.toThrow();

        // not an array
        draft[key] = 'not-an-array@nylas.com';
        expect(function() {
          draft.save();
        }).toThrow();

        // not an array of emails
        draft[key] = ['bengotow@gmail.com'];
        expect(function() {
          draft.save();
        }).toThrow();

        // not an array of objects without email key
        draft[key] = [{name: 'Ben'}];
        expect(function() {
          draft.save();
        }).toThrow();
      }
    });
  });
});
