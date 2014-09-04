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
    'object': 'crazy_type',
    'namespace': 'fake_namespace_id',
    'created_at': 1398229259,
    'updated_at': 1398229259
  };

  var INTestObjectWithMapping = function(mapping) {
    function INTestObject(inbox, id, namespaceId) {
      INModelObject.call(this, inbox, id, namespaceId);
    }
    inherits(INTestObject, INModelObject);
    defineResourceMapping(INTestObject, mapping);
    return INTestObject;
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


  describe('namespace()', function() {
    it ('should return the namespace instance associated with the model', function() {
      var obj = new INModelObject(inbox);
      obj._.namespace = namespace;
      expect(obj.namespace().id).toBe(namespace.id);
    });

    it ('should return a namespace with the correct ID if no instance is associated with the model', function() {
      var obj = new INModelObject(inbox, 'fake_object_id', namespace.id);
      expect(obj.namespace().id).toBe(namespace.id);
    });
  });


  describe('baseUrl()', function() {
    it ('should call baseUrl() on the associated Inbox instance', function() {
      spyOn(InboxAPI.prototype, 'baseUrl').andCallFake(function() {
        return 'http://test.com/';
      });
      var obj = new INModelObject(inbox);
      expect(obj.baseUrl()).toBe('http://test.com/');
      expect(INNamespace.prototype.baseUrl).toHaveBeenCalled();
    });
  });

  describe('namespaceUrl()', function() {
    it ('should return the baseUrl with the namespace appended', function(){
      var obj = new INModelObject(inbox, 'fake_object_id', 'my_great_namespace_id');
      expect(obj.namespaceUrl()).toBe('http://api.inboxapp.co/n/my_great_namespace_id');
    });

    it ('should throw an exception if the model does not have a namespace ID', function() {
      var obj = new INModelObject(inbox, 'fake_object_id');
      expect(function() { obj.namespaceUrl() }).toThrow();
    })
  });


  describe('namespaceId()', function() {
    it ('should return the namespace ID regardless of how the namespace was provided', function () {
      var obj;

      obj = new INModelObject(inbox, 'fake_object_id', 'fake_namespace_id');
      expect(obj.namespaceId()).toBe('fake_namespace_id');

      obj = new INModelObject(namespace, 'fake_object_id');
      expect(obj.namespaceId()).toBe('fake_namespace_id');

      obj = new INModelObject(inbox, mockObject);
      expect(obj.namespaceId()).toBe(mockObject.namespace);
    });
  });

  describe('isUnsynced()', function() {
    it ('should return true if the object has a self-defined ID', function() {
      obj = new INModelObject(inbox);
      expect(obj.isUnsynced()).toBe(true);
    });

    it ('should return false if the object has an ID', function() {
      obj = new INModelObject(inbox, 'fake_object_id');
      expect(obj.isUnsynced()).toBe(false);
    });
  });


  describe('update()', function() {
    var deepEquals = function(obj1, obj2) {
      expect(obj1.id).toBe(obj2.id);
      expect(obj1.updatedAt.getTime()).toBe(obj2.updatedAt.getTime());
      expect(obj1.createdAt.getTime()).toBe(obj2.createdAt.getTime());
    }

    it ('should do nothing if no data is provided', function() {
      obj1 = new INModelObject(inbox, mockObject);
      obj2 = new INModelObject(inbox, mockObject);
      obj1.update(null);
      deepEquals(obj1, obj2);
    })

    it ('should ignore JSON keys that are not in the resource mapping', function() {
      obj1 = new INModelObject(inbox, mockObject);
      obj1.update({'nonexistent': 'value'});
      expect(obj1['nonexistent']).toBe(undefined);
    })

    it ('should ignore JSON keys that are declared to be constants', function() {
      var INTestObject = INTestObjectWithMapping({
        'type': 'const:good-object',
        'myOrigin': 'const:origin:earth'
      });

      obj1 = new INTestObject(inbox, {});
      obj1.update({
        'type': 'evil-object',
        'origin': 'mars'
      });
      expect(obj1.type).toBe('good-object');
      expect(obj1.myOrigin).toBe('earth');
    });

    it ('should update properties, applying name mappings', function() {
      var INTestObject = INTestObjectWithMapping({
        'name': 'name',
        'dateOfBirth': 'dob'
      });

      obj1 = new INTestObject(inbox, {
        'name': 'First',
        'dob': 'April 12, 1988'
      });
      expect(obj1.name).toBe('First');
      expect(obj1.dateOfBirth).toBe('April 12, 1988');

      obj1.update({
        'name': 'Second',
        'dob': 'June 11, 1988'
      });
      expect(obj1.name).toBe('Second');
      expect(obj1.dateOfBirth).toBe('June 11, 1988');
    });


    it ('should correctly apply array cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'list': 'array:list'
      });

      obj1 = new INTestObject(inbox, {});
      obj1.update({
        'list': ['a']
      });
      expect(obj1.list.length).toBe(1);
 
      obj1.update({
        'list': ['a', 'b', 'c']
      });
      expect(obj1.list.length).toBe(3);
    });

    it ('should correctly apply date cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'timestamp': 'date:timestamp'
      });

      obj1 = new INTestObject(inbox, {});
      obj1.update({
        'timestamp': 'April 12, 1988'
      });
      expect(obj1.timestamp.getTime()).toBe(new Date('April 12, 1988').getTime());
 
      obj1 = new INTestObject(inbox, {
        'timestamp': 1398229259
      });
      expect(obj1.timestamp.getTime()).toBe(new Date(1398229259000).getTime());
 
      var d = new Date();
      obj1.update({
        'timestamp': d
      });
      expect(obj1.timestamp).toBe(d);
    });

    it ('should correctly apply the int cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'days': 'int:days'
      });
      var obj1 = new INTestObject(inbox, {
        'days': 1.34
      });
      expect(obj1.days).toBe(1);
    });
    
    it ('should correctly apply boolean cast to truthy and falsy values', function() {
      var INTestObject = INTestObjectWithMapping({
        'alive': 'bool:alive'
      });

      obj1 = new INTestObject(inbox, {});
      obj1.update({ 'alive': 0 });
      expect(obj1.alive).toBe(false);
 
      obj1.update({ 'alive': 1 });
      expect(obj1.alive).toBe(true);

      obj1.update({ 'alive': false });
      expect(obj1.alive).toBe(false);

      obj1.update({ 'alive': 'true' });
      expect(obj1.alive).toBe(true);

      obj1.update({ 'alive': null });
      expect(obj1.alive).toBe(false);
    });
  });

  describe('raw()', function() {
    it ('should return an empty hash for an object with no mapped properties', function() {
      var INTestObject = INTestObjectWithMapping({});
      var obj1 = new INTestObject(inbox, {});
      obj1.randomProperty = '123';
      expect(Object.keys(obj1.raw()).length).toBe(0);
    });

    it ('should use the resource mapping to output JSON property names', function() {
      var INTestObject = INTestObjectWithMapping({
        'fullName': 'full_name'
      });
      var obj1 = new INTestObject(inbox, {
        'full_name': 'Ben'
      });
      expect(obj1.raw().full_name).toBe('Ben');
    });

    it ('should include const properties', function() {
      var INTestObject = INTestObjectWithMapping({
        'origin': 'const:earth'
      });
      var obj1 = new INTestObject(inbox, {});
      expect(obj1.raw().origin).toBe('earth');
    });

    it ('should correctly apply the array cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'list': 'array:list'
      });
      var obj1 = new INTestObject(inbox, {});
      obj1.list = ['1', '2', '3'];
      expect(obj1.raw().list.length).toBe(3);
    });
    
    it ('should correctly apply the bool cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'alive': 'bool:alive'
      });
      var obj1 = new INTestObject(inbox, {});
      obj1.alive = true;
      expect(obj1.raw().alive).toBe(true);
      obj1.alive = '1';
      expect(obj1.raw().alive).toBe(true);
      obj1.alive = 1;
      expect(obj1.raw().alive).toBe(true);
      obj1.alive = false;
      expect(obj1.raw().alive).toBe(false);
      obj1.alive = 0;
      expect(obj1.raw().alive).toBe(false);
    });
    
    it ('should correctly apply the date cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'birthday': 'date:birthday'
      });
      var obj1 = new INTestObject(inbox, {});
      obj1.birthday = new Date(1398229259000);
      console.log(obj1.birthday.getTime());
      console.log(obj1.raw().birthday);
      expect(obj1.raw().birthday).toBe(1398229259);
    });

    it ('should correctly apply the int cast', function() {
      var INTestObject = INTestObjectWithMapping({
        'days': 'int:days'
      });
      var obj1 = new INTestObject(inbox, {});
      obj1.days = 1.34;
      expect(obj1.raw().days).toBe(1);
    });
    
  });

});
