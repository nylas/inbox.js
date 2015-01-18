inbox.js [![Build Status](https://travis-ci.org/inboxapp/inbox.js.svg?branch=master)](https://travis-ci.org/inboxapp/inbox.js)
========

Client-side SDK for communicating with the InboxApp API.

## **NOTE**: This SDK is currently not actively maintained, and may need some TLC. Please feel free to use it and send us a pull request if you fix anything or add a feature, though. :)

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
