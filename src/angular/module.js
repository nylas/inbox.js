angular.module('inbox', []).
  provider('$inbox', function() {
    var config = {
      baseUrl: null,
      http: {
        headers: {},
        withCredentials: false
      }
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

    this.withCredentials = function(value) {
      if (!arguments.length) {
        return config.http.withCredentials;
      }
      config.http.withCredentials = !!value;
      return this;
    };

    this.setRequestHeader = function(header, value) {
      if (arguments.length > 1) {
        header = ('' + header).toLowerCase();
        if (HEADER_REGEXP.test(header)) {
          config.http.headers[header] = value;
        }
      }
      return this;
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
