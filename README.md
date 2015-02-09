inbox.js [![Build Status](https://travis-ci.org/inboxapp/inbox.js.svg?branch=master)](https://travis-ci.org/inboxapp/inbox.js)
========

### **NOTE**: This SDK is currently not actively maintained, and may need some TLC. Please feel free to use it and send us a pull request if you fix anything or add a feature.

The Inbox Javascript SDK makes writing email clients for the web simple and enjoyable. The Javascript SDK is still a work in progress, and will be significantly expanded in the coming months to be a feature complete wrapper around the Inbox API.

Before using the Inbox JS SDK, make sure you've followed the [instructions](http://nilas.com/docs/gettingstarted) for installing the open-source Inbox server. We'll be making Inbox available as a hosted solution soon, but for now you'll need to run the Inbox Sync Engine on your local machine to develop your applications.

The Inbox Javascript SDK is open source and we welcome pull requests on Github! If you find problems with the Javascript SDK, please submit them as issues on the Inbox.js repository.

##Building Inbox.js

To begin with, it's necessary to set up a development environment:

```bash
git clone https://github.com/inboxapp/inbox.js.git

cd inbox.js

npm install

sudo npm install -g gulp karma-cli
```

Once a development environment is set up, you can build using the following command:

```bash
gulp build
```

Additionally, you can run tests with the following command:

```bash
gulp test
```

To run the examples web-server, begin by ensuring that you've set up [inbox](https://github.com/inboxapp/inbox) and have the API server up and running, then simply run the following command:

```bash
gulp serve --port=<OPTIONAL PORT> --host=<OPTIONAL HOST>
```


##Contributing

We'd love your help making Inbox better! Join the Google Group for project updates and feature discussion. We also hang out in [##inbox on irc.freenode.net](http://webchat.freenode.net/?channels=##inbox), or you can email help@inboxapp.com.

Please sign the [Contributor License Agreement](https://www.inboxapp.com/cla.html) before submitting patches. (It's similar to other projects, like NodeJS.)

A more detailed guide on development, testing and contributing code is available in [CONTRIBUTING.md](CONTRIBUTING.md).

##License

Please see the file [LICENSE.md](LICENSE.md) for the copyright licensing conditions attached to
this codebase.

## Angular Example
------

Download the Javascript SDK from Github—for this example, we'll be using the angular bindings included with the SDK.

To get started, we need to first create our global service for communicating with Inbox. There should typically be only one of these per application, and so in the AngularJS build, it’s registered as a configurable service. In VanillaJS, it’s possible to create as many of these as desired.

To begin with, lets configure the Inbox service to talk to the default API server hosted in the vagrant VM from port 5555. If you’re hosting the Inbox server from a specific host or port, you can change the base URL accordingly:

```javascript
angular.module('inboxExampleApp', ['inbox', 'ngSanitize']).
  config(function($inboxProvider) {
    $inboxProvider.
      baseUrl('http://localhost:5555').
      appId('test');
  });
```

In VanillaJS, we can do this instead:

```javascript
window.$inbox = InboxAPI({
  baseUrl: 'http://localhost:5555',
  appId: 'test',
  promise: window.Promise || YourFavouriteES6CompatiblePromiseConstructor
});
```

Now that we’re all set, we’re going to want to get a handle on the accounts we have access to. Currently, it’s not quite possible to only get the accounts we have access to, proper authentication is forthcoming. However, we can view all of the namespaces exposed from the service and use those.

To query for all namespaces accessible, you can do this:

```javascript
function namespacesController($scope, $inbox) {
  function update() {
    $inbox.namespaces($scope.namespaces).
      then(null, function(error) {
        // We got an erroneous response! Alert the user!
        $scope.namespaces = [];
      });
  }
  $scope.updateNamespaces = update;
  $scope.namespaces = [];
  update();
}
```

It’s not necessary to pass an array to $inbox.namespaces(), however this will allow references to namespaces in the array to remain valid and be updated with new data, and this is generally a nice thing.

For Vanilla JS, this is very similar:

```javascript
window.$inboxNamespacesList = window.$inboxNamespacesList || [];
// We previously created an InboxAPI object named window.$inbox
$inbox.namespaces($inboxNamespacesList).
  then(function(namespaces) {
    // We got our new namespaces! $inboxNamespaceList has already
    // been populated with these, but we can do something useful
    // with them anyways.
  }, function(error) {
    // We got an error, alert the user!
  });
```

Now that we’ve got our namespaces, likely the next thing we’ll want to look at is threads of messages. At the time of writing, it’s only possible to ask for threads of messages per namespace, rather than per-user.

In this example, lets say we want to get a list of threads where the last message was newer than last night. While it is often desirable to perform this filtering on the client-side, in this case we’ll use the web service’s own filtering capabilities to do this for us.

```javascript
namespace.threads({
  lastMessageAfter: moment().subtract('days', 1).toDate()
}).
  then(function(threads) {
    // threads have arrived!
  }, function(error) {
    // An error occurred! Alert the user!
  });
```
  
So, we’ve got our set of threads, but we probably want to also look at the messages from those threads. There are a few options, but the simplest method for getting a collection of messages for a single thread is the following:


```javascript
thread.getMessages({
  lastMessageAfter: moment().subtract('days', 1).toDate()
}).
  then(function(messages) {
    // messages have arrived!
  }, function(error) {
    // An error occurred! Alert the user!
  });
```

This looks very similar to the previous query for threads, because it essentially works the same way. Once we get a response, it gets transformed into a collection of objects which we can render to the client.

Using AngularJS, it’s very easy to make an attractive list of thread messages visible here. The markup might look something like this (using Bootstrap CSS, and angular-sanitize):

```html
<div class="panel panel-default" ng-repeat="msg in threadMessages">
  <div class="panel-heading">
    <p>{{msg.subject}}</p>
  </div>
  <div class="panel-body" ng-bind-html="msg.body"></div>
</div>
```

We can expose as much or as little information associated with a message as we like here, but this example is aimed to showcase a very simple case.

With a little more work, we can add pagination, filtering messages, transforming the way participants are rendered, and many more fancy things, are quite possible.

While it’s currently not possible to create new drafts or send messages, and certain querying faculties are not yet implemented, the JS SDK is evolving quickly and will shortly be able to perform these tasks. This document will be updated accordingly when that is the case.
