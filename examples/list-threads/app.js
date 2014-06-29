angular.module('inbox_list_namespaces', ['inbox', 'ngSanitize']).
config(['$inboxProvider', function($inboxProvider) {
  $inboxProvider.
    baseUrl('http://localhost:5555').
    appId('test');
}]).
service('$namespaces', ['$inbox', function($inbox) {
  var updateId = null, updateRate = null;
  var self = this;
  self.namespaces = null;
  Events(self);
  function setNamespaces(value) {
    self.namespaces = value;
    self.emit('update', value);
  }

  function updateList() {
    $inbox.namespaces().then(function(namespaces) {
      setNamespaces(namespaces);
    }, function(error) {
      setNamespaces(null);
    });
  }

  function clearScheduledUpdate() {
    if (updateId !== null) {
      clearInterval(updateId);
      updateId = null;
    }
  }

  function updateRate(ms) {
    clearScheduledUpdate();
    if (arguments.length > 0) {
      updateRate = ms;
    }
    updateId = setInterval(updateList, updateRate);
  }

  self.scheduleUpdate = updateRate;
  updateList();
}]).
filter('shorten', function() {
  return function(input) {
    if (typeof input === 'string' && input.length > 64) {
      return input.substring(0, 60) + ' ...';
    }
    return input;
  }
}).
controller('threadsCtrl', ['$scope', '$namespaces', function(scope, $namespaces) {
  var threads = scope.threads = {};
  var filters = scope.filters = {};
  var self = this;
  function loadThreads(namespace, idx) {
    if (!threads[namespace.id]) threads[namespace.id] = [];
    namespace.threads(threads[namespace.id]).then(function(threads) {
      return threads;
    }, function(error) {
      console.log(error);
    });
  }
  function update(namespaces) {
    if (namespaces) {
      var seen = {};
      var key;
      for (var i=0; i<namespaces.length; ++i) {
        seen[namespaces[i].id] = true;
        loadThreads(namespaces[i], i);
      }
      for (key in threads) {
        if (!seen[key]) delete threads[key];
      }
    }
  }

  this.select = function(thread) {
    if (thread) {
      thread.getMessages().then(function(messages) {
        self.selectedThreadMessages = messages;
      }, function() {
        // show error message
      });
    }
  }

  this.selectedThreadMessages = null;

  $namespaces.on('update', update);
  update($namespaces.namespaces);
}]);
