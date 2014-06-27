angular.module('inbox_list_namespaces', ['inbox']).
config(['$inboxProvider', function($inboxProvider) {
  $inboxProvider.
    baseUrl('https://gunks.inboxapp.com').
    appId('test');
}]).
controller('inboxNamespacesCtrl', ['$scope', '$inbox', function(scope, $inbox) {
  var self = this;
  function updateList() {
    $inbox.namespaces().then(function(namespaces) {
      self.namespaces = namespaces;
    }, function(error) {
      self.namespaces = null;
    });
  }
  updateList();
  var updateId = setInterval(updateList, 600000);
}]);
