describe('InboxAPI', function() {
  var haveNativePromise = false;
  var haveOwnNativePromise;
  var originalPromise = null;
  var MockPromise = null;

  beforeEach(function() {
    haveNativePromise = 'Promise' in window;
    haveOwnNativePromise = haveNativePromise && window.hasOwnProperty('Promise');
    originalPromise = window.Promise;
    MockPromise = jasmine.createSpy('Promise');
  });

  afterEach(function() {
    MockPromise = null;
    if (haveNativePromise) {
      if (haveOwnNativePromise) {
        window.Promise = originalPromise;
      } else {
        delete window.Promise;
      }
    } else if ('Promise' in window) {
      delete window.Promise;
    }
    originalPromise = null;
    haveOwnNativePromise = false;
  });

  function mockPromise() {
    window.Promise = MockPromise;
  }

  function mockNoPromise() {
    if (haveNativePromise) {
      window.Promise = undefined;
    }
  }

  describe('constructor', function() {
    it('should return InboxAPI instance when called with `new`', function() {
      expect(new InboxAPI({
        appId: '',
        baseUrl: 'api.inboxapp.com',
        promise: function() {}
      }) instanceof InboxAPI).toBe(true);
    });


    it('should return InboxAPI instance when called without `new`', function() {
      expect(InboxAPI({
        appId: '',
        baseUrl: 'api.inboxapp.com',
        promise: function() {}
      }) instanceof InboxAPI).toBe(true);
    });


    it('should construct with native Promise if available', function() {
      mockPromise();
      var inbox = new InboxAPI({
        appId: '',
        baseUrl: 'api.inboxapp.com'
      });
      expect(typeof inbox._.promise).toBe('function');
      inbox._.promise(function() {});
      expect(MockPromise).toHaveBeenCalled();
    });


    it('should use default baseUrl if baseUrl parameter is not supplied', function() {
      mockPromise();
      expect(InboxAPI('', null)._.baseUrl).toBe('http://api.inboxapp.com/');
    });


    it('should use default baseUrl if options.baseUrl is not present', function() {
      expect(InboxAPI({ appId: '' })._.baseUrl).toBe('http://api.inboxapp.com/');
    });


    it('should use INStubCache if no cache is specified', function() {
      var inbox = InboxAPI({ appId: '' });
      expect(inbox._.cache instanceof INStubCache).toBe(true);
    });


    it('should use INStubCache if null cache is specified', function() {
      var inbox = InboxAPI({ appId: '', cache: null });
      expect(inbox._.cache instanceof INStubCache).toBe(true);
    });


    it('should use INIDBCache if `indexeddb` cache is specified', function() {
      var inbox = InboxAPI({ appId: '', cache: 'indexeddb' });
      expect(inbox._.cache instanceof INIDBCache).toBe(true);
    });


    it('should use specified cache if registered', function() {
      var inbox = InboxAPI({ appId: '', cache: INIDBCache });
      expect(inbox._.cache instanceof INIDBCache).toBe(true);
    });


    describe('errors', function() {
      it('should be thrown when `options.appId` is not present', function() {
        expect(function() {
          new InboxAPI({});
        }).toThrow('Unable to construct `InboxAPI`: missing `appId`.');
      });


      it('should be thrown when `options.appId` is not a string', function() {
        expect(function() {
          new InboxAPI({ appId: 43 });
        }).toThrow('Unable to construct `InboxAPI`: option `appId` must be a string.');
      });


      it('should be thrown when positional `appId` is not present', function() {
        expect(function() {
          new InboxAPI();
        }).toThrow('Unable to construct `InboxAPI`: missing `appId`.');
      });


      it('should be thrown when positional `appId` is not a string', function() {
        expect(function() {
          new InboxAPI(35);
        }).toThrow('Unable to construct `InboxAPI`: option `appId` must be a string.');
      });


      it('should be thrown when positional `baseUrl` not a string', function() {
        expect(function() {
          new InboxAPI('', 35);
        }).toThrow('Unable to construct `InboxAPI`: option `baseUrl` must be a string.');
      });


      it('should be thrown when options.baseUrl is not string', function() {
        expect(function() {
          new InboxAPI({ appId: '', baseUrl: 57 });
        }).toThrow('Unable to construct `InboxAPI`: option `baseUrl` must be a string.');
      });


      it('should be thrown when options.promise is not present and not available on window', function() {
        mockNoPromise();
        expect(function() {
          new InboxAPI({ appId: '', baseUrl: 'api.inboxapp.com' });
        }).toThrow('Unable to construct `InboxAPI`: missing option `promise`, or no native ' +
                   'Promise available');
      });


      it('should be thrown when options.promise is specified and not a function', function() {
        expect(function() {
          new InboxAPI({ appId: '', baseUrl: 'api.inboxapp.com', promise: 999 });
        }).toThrow('Unable to construct `InboxAPI`: option `promise` must be a function which ' +
                   'returns an ECMAScript6-compatible Promise');
      });


      it('should be thrown if cache is specified and not registered', function() {
        expect(function() {
          var inbox = InboxAPI({ appId: '', cache: 'fakeCacheName123' });
        }).toThrow('Cache fakeCacheName123 is not registered.');

        var error;
        try {
          var inbox = InboxAPI({ appId: '', cache: function fakeCacheName123() {} });
        } catch (e) {
          error = e;
        }
        expect(error && error.message).toMatch(/^Cache .*? is not registered\.$/);
      });
    });
  });


  describe('appId()', function() {
    it('should be a function', function() {
      expect(typeof (new InboxAPI('myApp', 'https://myapp.com')).appId).toBe('function');
    });


    it('should return the configured appId', function() {
      expect((new InboxAPI('myApp', 'https://myapp.com')).appId()).toBe('myApp');
    });
  });
});
