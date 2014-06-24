angular.module('inbox', []).
  provider('$inbox', function() {
    var config = {
      baseUrl: null
    };

    this.baseUrl = function(value) {
      if (arguments.length >= 1) {
        config.baseUrl = typeof value === 'string' ? value : null;
        return this;
      }
      return config.baseUrl;
    };

    this.appId = function(value) {
      if (arguments.length >= 1) {
        config.appId = '' + value;
        return this;
      }
      return config.appId;
    };

    this.$get = ['$q', function($q) {
      var tempConfig;
      var Promise = function(resolver) {
        if (typeof resolver !== 'function') {
          throw new TypeError('resolver must be a function');
        }
        var deferred = $q.defer();
        resolver(function(value) {
          deferred.resolve(value);
        }, function(reason) {
          deferred.reject(reason);
        });
        return deferred.promise;
      };
      tempConfig = angular.extend({promise: Promise}, config);
      return new InboxAPI(tempConfig);
    }];
  });