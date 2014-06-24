describe('angular', function() {
  beforeEach(module('inbox'));
  describe('$inbox', function() {
    it('should use baseUrl/appId from $inboxProvider', function() {
      module(function($inboxProvider) {
        $inboxProvider.
          baseUrl('foo.com/bar').
          appId('testApp');
      });
      inject(function($inbox) {
        expect($inbox._.baseUrl).toBe('foo.com/bar');
        expect($inbox._.appId).toBe('testApp');
      });
    });


    it('should use default baseUrl if baseUrl is not defined', function() {
      module(function($inboxProvider) {
        $inboxProvider.appId('testApp');
      });
      inject(function($inbox) {
        expect(typeof $inbox._.baseUrl).toBe('string');
      });
    });


    it('should throw if appId is not defined', function() {
      expect(function() {
        inject(function($inbox) {});
      }).toThrow();
    });


    describe('', function() {
      // Misc. verifications
      beforeEach(module(function($inboxProvider) {
        $inboxProvider.appId('testApp');
      }));


      it('should be instance of InboxAPI', inject(function($inbox) {
        expect($inbox instanceof InboxAPI).toBe(true);
      }));


      it('should use $q promises', inject(function($inbox, $q) {
        var qPromise = $q.defer().promise;
        var inboxPromise = $inbox._.promise(function() {});
        expect(typeof inboxPromise.constructor).toBe('function');
        expect(inboxPromise.constructor).toBe(qPromise.constructor);
      }));
    });
  });
});
