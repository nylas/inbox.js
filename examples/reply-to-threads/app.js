angular.module('inbox_reply_threads', ['inbox', 'ngSanitize']).
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
directive('msgFooter', function() {
  return {
    restrict: 'A',
    scope: {
      message: '=msgFooter'
    },
    replace: true,
    link: function(scope, element, attr) {
      scope.editorOpen = false;
      var thread = scope.thread = scope.message.thread();
      var draft = scope.draft = null;

      function hideEditor() {
        draft = scope.draft = null;
        element.addClass('text-right');
        scope.editorOpen = false;
      }

      scope.openEditor = function() {
        if (scope.editorOpen) return;
        scope.editorOpen = true;
        scope.draft = draft = scope.message.reply();
        element.removeClass('text-right');
      };

      scope.dispose = function() {
        if (!scope.editorOpen) return;
        draft.dispose();
        hideEditor();
      };
      scope.save = function() {
        if (!scope.editorOpen) return;
        draft.save();
      };
      scope.send = function() {
        if (!scope.editorOpen) return;
        draft.send().then(function(response) {
          // add to thread
          thread.reload();
          hideEditor();
        }, function(err) {
          // Alert error
        });
      };
    },
    template: [
    '<div class="panel-footer text-right">',
      '<div class="btn-group" ng-if="!editorOpen">',
        '<button type="button" class="btn btn-default" ng-click="openEditor()">reply</button>',
      '</div>',
      '<div class="panel panel-default" ng-if="editorOpen">',
        '<div class="panel-heading">',
          '<div class="input-group">',
            '<span class="input-group-addon">Reply</span>',
            '<input type="text" readonly class="form-control" name="subject" value="Re: {{message.subject}}">',
          '</div>',
          '<div class="input-group">',
            '<span class="input-group-addon">To:</span>',
            '<input type="text" make-participants class="form-control" name="to" ng-model="draft.to">',
          '</div>',
        '</div>',
        '<div class="panel-body" summer-note ng-model="draft.body">',
        '</div>',
        '<div class="panel-footer text-right">',
          '<div class="btn-group">',
            '<button type="button" class="btn btn-default glyphicon glyphicon-trash" ng-click="dispose()"></button>',
            '<button type="button" class="btn btn-default glyphicon glyphicon-floppy-disk" ng-click="save()"></button>',
            '<button type="button" class="btn btn-default glyphicon glyphicon-send" ng-click="send()">&nbsp;Send</button>',
          '</div>',
        '</div>',
      '</div>',
    '</div>'
    ].join('\n'),
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
controller('threadsCtrl', ['$scope', '$namespaces', function(scope, $namespaces) {
  var threads = scope.threads = {};
  var filters = scope.filters = {};
  var self = this;
  self.selectedThreadID = null;
  function loadThreads(namespace, idx) {
    var _2WeeksAgo = ((new Date().getTime() - 1209600000) / 1000) >>> 0;
    if (!threads[namespace.id]) threads[namespace.id] = [];
    namespace.threads(threads[namespace.id], {
      lastMessageAfter: _2WeeksAgo,
      limit: 1000
    }).then(function(threads) {
      threads.sort(function(a, b) {
        a = a.lastMessageDate.getTime();
        b = b.lastMessageDate.getTime();
        return b - a;
      });
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
  var selectedNode;
  this.select = function(thread, event) {
    if (event) {
      if (event.currentTarget === selectedNode) return;
      angular.element(selectedNode).removeClass('active');
      selectedNode = event.currentTarget;
      angular.element(selectedNode).addClass('active');
    }
    if (thread) {
      self.selectedThreadID = thread.id;
      thread.messages().then(function(messages) {
        self.selectedThreadMessages = messages;
      }, function() {
        // show error message
      });
    } else {
      thread = null;
    }
  }

  this.selectedThreadMessages = null;

  $namespaces.on('update', update);
  update($namespaces.namespaces);
}]);
