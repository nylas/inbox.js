describe('INModelObject', function() {
  var inbox;
  var namespace;

  var mockNamespace = {
    'account': 'fake_account_id',
    'email_address': 'fake.email@inboxapp.co',
    'id': 'fake_namespace_id',
    'namespace': 'fake_namespace_id',
    'object': 'namespace',
    'provider': 'FakeProvider'
  };

  var mockObject = {
    'id': 'fake_object_id',
    'namespace': 'fake_namespace_id',
    'created_at': 1398229259
  };

  beforeEach(function() {
    inbox = new InboxAPI({
      appId: '',
      baseUrl: 'http://api.inboxapp.co/'
    });
    namespace = new INNamespace(inbox, mockNamespace);
  });

  describe('constructor()', function() {
    var check = function(obj) {
      expect(obj.namespaceID).toBe(namespace.id);
      expect(obj.namespace().id).toBe(namespace.id);
      expect(obj.inbox()).toBe(inbox);
      expect(obj.id).toBe(mockObject.id);
    };

    it ('should accept (inbox, json data)', function() {
      check(new INModelObject(inbox, mockObject));
    });

    it ('should accept (namespace, json data)', function() {
      check(new INModelObject(namespace, mockObject));
    });

    it ('should accept (namespace, json data) iff the namespace ids are identical', function() {
      check(new INModelObject(namespace, mockObject));
      expect(function() {
        new INModelObject(namespace, {
          'id': 'fake_object_id',
          'namespace': 'bogus_namespace_id'
        })
      }).toThrow();
    });

    it ('should accept (namespace, object id)', function() {
      check(new INModelObject(namespace, 'fake_object_id'));
    });

    it ('should accept (namespace, object id, namespace id) iff the namespace ids are identical', function() {
      check(new INModelObject(namespace, 'fake_object_id', namespace.id));
      expect(function() {
        new INModelObject(namespace, 'fake_object_id', 'bogus_namespace_id');
      }).toThrow();
    });
    
    it ('should accept (inbox, object id, namespace id)', function() {
      check(new INModelObject(inbox, 'fake_object_id', namespace.id));
    });

    it ('should populate the object whenver json data is provided', function() {
      var obj = new INModelObject(inbox, mockObject);
      expect(obj.createdAt.getTime()/1000).toBe(mockObject.created_at);
    });

    it ('should use a self-assigned ID for the model if none is provided', function() {
      var obj = new INModelObject(inbox);
      expect(obj.id).toBe('-selfdefined');
    })

  });
});
