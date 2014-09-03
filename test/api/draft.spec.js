describe('INDraft', function() {
  var inbox;
  var mockNamespace;

  beforeEach(function() {
    window.Promise = mockPromises.getMockPromise(window.Promise);
    server = sinon.fakeServer.create();
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
    });
    namespace = new INNamespace(inbox, mockNamespace);
    
    mockNamespace = {
      'account': 'fake_account_id',
      'email_address': 'fake.email@inboxapp.co',
      'id': 'fake_namespace_id',
      'object': 'namespace',
      'provider': 'FakeProvider'
    };

  });

  describe('INThread#drafts()', function() {
    // TODO:
    // Implement tests for INThread#drafts().
    //
    // These should be similar to tests for INThread#messages().
  });

  describe ('save()', function() {
    // Messages should be immutable, so this should never matter in practice, but it's theoretically
    // possible to protect against properties being overwritten on the client-side. However, there's
    // no real reason for this.
    it('should throw an exception if the to, cc, or bcc fields are not properly formatted', function() {
      var data = {
        'to': [{'name': 'Ben', 'email':'ben@inboxapp.com'}],
        'cc': [{'name': 'Michael', 'email':'mg@inboxapp.com'}],
        'bcc': [{'name': 'Spang', 'email':'spang@inboxapp.com'}],
        'subject': 'My New Draft'
      };

      var keys = ['to', 'cc', 'bcc'];
      for (var ii = 0; ii < keys.length; ii ++) {
        var key = keys[ii];
        var draft = new INDraft(inbox, data);

        // valid
        expect(function() {
          draft.save();
        }).not.toThrow('To, From, CC, and BCC must be arrays of objects with emails and optional names.');

        // not an array
        draft[key] = 'not-an-array@inboxapp.com';
        expect(function() {
          draft.save();
        }).toThrow('To, From, CC, and BCC must be arrays of objects with emails and optional names.');

        // not an array of emails
        draft[key] = ['bengotow@gmail.com'];
        expect(function() {
          draft.save();
        }).toThrow('To, From, CC, and BCC must be arrays of objects with emails and optional names.');

        // not an array of objects without email key
        draft[key] = [{name: 'Ben'}];
        expect(function() {
          draft.save();
        }).toThrow('To, From, CC, and BCC must be arrays of objects with emails and optional names.');
      }
    });
  });
});
