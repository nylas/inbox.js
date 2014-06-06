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
        baseUrl: 'api.inboxapp.co',
        promise: function() {}
      }) instanceof InboxAPI).toBe(true);
    });


    it('should return InboxAPI instance when called without `new`', function() {
      expect(InboxAPI({
        baseUrl: 'api.inboxapp.co',
        promise: function() {}
      }) instanceof InboxAPI).toBe(true);
    });


    it('should construct with native Promise if available', function() {
      mockPromise();
      var inbox = new InboxAPI({
        baseUrl: 'api.inboxapp.co'
      });
      expect(typeof inbox._.promise).toBe('function');
      inbox._.promise(function() {});
      expect(MockPromise).toHaveBeenCalled();
    });


    it('should use default baseUrl if first parameter is not supplied', function() {
      mockPromise();
      expect(InboxAPI(null)._.baseUrl).toBe('http://api.inboxapp.com/');
    });


    it('should use default baseUrl if options.baseUrl is not present', function() {
      expect(InboxAPI({})._.baseUrl).toBe('http://api.inboxapp.com/');
    });


    describe('errors', function() {
      it('should be thrown when first parameter is not a string', function() {
        expect(function() {
          new InboxAPI(35);
        }).toThrow("Unable to construct 'InboxAPI': option `baseUrl` must be a string.");
      });


      it('should be thrown when second parameter is not a function', function() {
        expect(function() {
          new InboxAPI('api.inboxapp.co', 32);
        }).toThrow("Unable to construct 'InboxAPI': option `promise` must be a function " +
                   "which returns an ECMAScript6-compatible Promise");
      });


      it('should be thrown when options.baseUrl is not string', function() {
        expect(function() {
          new InboxAPI({ baseUrl: 57 });
        }).toThrow("Unable to construct 'InboxAPI': option `baseUrl` must be a string.");
      });


      it('should be thrown when options.promise is not present and not available on window',
          function() {
        mockNoPromise();
        expect(function() {
          new InboxAPI({ baseUrl: 'api.inboxapp.co' });
        }).toThrow("Unable to construct 'InboxAPI': missing option `promise`, or no native " +
                   "Promise available");
      });


      it('should be thrown when options.promise is specified and not a function', function() {
        expect(function() {
          new InboxAPI({ baseUrl: 'api.inboxapp.co', promise: 999 });
        }).toThrow("Unable to construct 'InboxAPI': option `promise` must be a function which " +
                   "returns an ECMAScript6-compatible Promise");
      });
    });
  });
});
