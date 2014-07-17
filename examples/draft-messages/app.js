angular.module('inbox_draft_messages', ['inbox', 'ngSanitize']).
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
directive('makeParticipants', function() {
  function format(value) {
    if (value && Object.prototype.toString.call(value) === '[object Array]') {
      var str = '';
      var p;
      for (var i=0; i<value.length; ++i) {
        p = value[i];
        if (p && typeof p === 'object' && p.email) {
          str += str ? ', ' + p.email : p.email;
        }
      }
      return str;
    }
  }

  function parse(value) {
    if (typeof value === 'string') {
      value = value.split(/\s*,\s*/);
      for (var i=value.length; --i >= 0;) {
        if (!value[i]) value.splice(i, 1);
        else {
          value[i] = {
            name: '',
            email: value[i]
          };
        }
      }
    }
    return value;
  }
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$formatters.push(format);
      ngModel.$parsers.push(parse);
    }
  };
}).
directive('summerNote', function() {
  return {
    require: '?ngModel',
    link: function(scope, element, attr, ngModel) {
      element.summernote({
        codemirror: {
          theme: 'monokai'
        },
        height: attr.height || 300,
        onpaste: listener,
        onChange: listener,
        onToolbarClick: listener,
        toolbar: [
          ['style', ['bold', 'italic', 'underline']],
          ['fontname', ['fontname']],
          ['color', ['color']],
          ['fontsize', ['fontsize']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['extra', ['fullscreen', 'codeview', 'undo', 'redo', 'help']]
        ]
      });

      function listener() {
        var contents = element.code();
        if (ngModel && contents !== ngModel.$viewValue) {
          ngModel.$setViewValue(contents);
          scope.$apply();
        }
      }

      function destroy() {
        element.destroy();
      }

      scope.$on('$destroy', destroy);
    }
  };
}).
controller('draftsCtrl', ['$scope', '$namespaces', function(scope, $namespaces) {
  var namespaces = scope.namespaces = [];
  var filters = scope.filters = {};
  var self = this;
  function update(ns) {
    namespaces = scope.namespaces = ns || [];
  }
  var selectedNode;

  this.selectedThreadMessages = null;
  var currentDraft = self.current = null;

  this.new = function(namespace, event) {
    if (event) {
      if (event.currentTarget === selectedNode) return;
      angular.element(selectedNode).removeClass('active');
      selectedNode = event.currentTarget;
      angular.element(selectedNode).addClass('active');
    }
    if (currentDraft) {
      currentDraft.dispose();
      currentDraft = self.current = null;
    }

    if (namespace) {
      currentDraft = self.current = namespace.draft();
    }
  };

  this.dispose = function() {
    if (currentDraft) {
      currentDraft.dispose();
      currentDraft = self.current = null;
    }
  };

  this.save = function() {
    if (currentDraft) {
      currentDraft.save();
    }
  };

  this.send = function() {
    if (currentDraft) {
      currentDraft.
        send().
        then(function(msg) {
          console.log(msg);
        }, function(err) {
          console.log(err);
        });
    }
  };

  $namespaces.on('update', update);
}]);
