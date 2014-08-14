var IE8_METHODS = /^(get|post|head|put|delete|options)$/i;


/**
 * @function
 * @name xhrForMethod
 * @private
 *
 * @description
 * Construct a new XMLHttpRequest. Under some circumstances, some Internet Explorer hacks are
 * required to make old IE happy.
 *
 * @param {string} method the method to use.
 *
 * @returns {XMLHttpRequest} a newly constructed XMLHttpRequest object.
 */
function xhrForMethod(method) {
  if (document.documentMode <= 8 && (method.match(IE8_METHODS) || !window.XMLHttpRequest)) {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    return new window.XMLHttpRequest();
  }
  return null;
}


/**
 * @function
 * @name xhrMaybeJSON
 * @private
 *
 * @description
 * Safari 7 has issues with responseType=json, because support for it was added to WebKit relatively
 * late. Due to it not being supported, the browser will throw an exception when assigning 'json'
 * to the responseType property, and we'd prefer to avoid this.
 *
 * In this library, even if json is not supported, we can still manually parse the JSON response.
 *
 * @param {XMLHttpRequest} xhr the HTTP request on which to operate
 */
function xhrMaybeJSON(xhr) {
  try {
    xhr.responseType = 'json';
  } catch(e) {
    // Safari 7 does not support the 'json' responseType, but supports the
    // responseType property, which will throw if passed an unsupported
    // DOMString value.
  }
}


/**
 * @function
 * @name xhrData
 * @private
 *
 * @description
 * Returns an XMLHttpRequest object and its response data into a wrapped response used by this
 * framework.
 *
 * @param {XMLHttpRequest} xhr the HTTP request on which to operate
 * @param {*} response the processed response data
 *
 * @returns {object} An object containing "status", "statusText", "data", and parsed headers as
 *   "headers".
 */
function xhrData(xhr, response) {
  return {
    status: xhr.status,
    statusText: xhr.statusText,
    data: response,
    headers: parseResponseHeaders(xhr)
  };
}


/**
 * @function
 * @name rejectXHR
 * @private
 *
 * @description
 * Returns an event listener which rejects an HTTP request.
 *
 * @param {object} cb an object containing a property 'cb', which is a function to call on
 *   completion. The returned callback will set that value to NULL when called, preventing
 *   it from being called multiple times.
 * @param {XMLHttpRequest} xhr the HTTP request on which to operate.
 * @param {string} type the response type --- typically JSON.
 *
 * @returns {function} a function to be used as an event listener for XMLHttpRequest events.
 */
function rejectXHR(cb, xhr, type) {
  return function() {
    if (!cb.cb) return;
    var callback = cb.cb;
    cb.cb = null;
    var response = null;
    if (type === 'json') {
      response = parseJSON('response' in xhr ? xhr.response : xhr.responseText);
    }
    callback(xhrData(xhr, response), null);
  };
}


/**
 * @function
 * @name parseResponseHeaders
 * @private
 *
 * @description
 * Parse an XMLHttpRequest's response headers into an object, by separating by newlines, and
 * splitting each string on the first instance of ': '.
 *
 * XMLHttpRequest exposes an opaque response which hides certain headers, so not all headers
 * can necessarily be returned from this method. See http://fetch.spec.whatwg.org/ and
 * http://xhr.spec.whatwg.org/ for details.
 *
 * @param {XMLHttpRequest} xhr the XMLHttpRequest to process.
 *
 * @returns {object} the parsed headers
 */
function parseResponseHeaders(xhr) {
  var headerStr = xhr.getAllResponseHeaders();
  var headers = {};
  if (!headerStr) {
    return headers;
  }
  var headerPairs = headerStr.split('\u000d\u000a');
  for (var i = 0; i < headerPairs.length; i++) {
    var headerPair = headerPairs[i];
    // Can't use split() here because it does the wrong thing
    // if the header value has the string ": " in it.
    var index = headerPair.indexOf('\u003a\u0020');
    if (index > 0) {
      var key = headerPair.substring(0, index);
      var val = headerPair.substring(index + 2);
      headers[key.toLowerCase()] = val;
    }
  }
  return headers;
}


/**
 * @function
 * @name apiRequest
 * @private
 *
 * @description
 * Method for making API requests to the Inbox server. This is meant to handle slight variations
 * between different implementations of XMLHttpRequest, and in the future may support Fetch
 * requests as well.
 *
 * This version of the call uses a simple callback on completion, rather than a promise, primariloy
 * due to issues with the promise mocks in the test harness. However there is a perf-benefit to this
 * as well, and we avoid creating unnecessary promises all the time.
 *
 * @param {InboxAPI} inbox the InboxAPI instance, used for its http configuration
 * @param {string} method the request method
 * @param {string} url the URL to route the HTTP request
 * @param {string|object=} data the data to send, defaults to null
 * @param {function(error, response)} callback function to be invoked after the request is complete
 */
function apiRequest(inbox, method, url, data, responseType, callback) {
  if (typeof responseType === 'function') {
    callback = responseType;
    responseType = null;
  }
  if (typeof data === 'function') {
    callback = data;
    data = null;
  } else if (typeof data !== 'string' && typeof data !== 'object') {
    data = null;
  }

  if (typeof callback !== 'function') {
    callback = noop;
  }

  var cb = {cb: callback};
  var xhr = xhrForMethod(method);

  xhr.withCredentials = inbox.withCredentials();    
  var failed = rejectXHR(cb, xhr, 'json');
  addListeners(xhr, {
    'load': function(event) {
      if (!cb.cb) return;
      var response;
      switch (xhr._responseType) {
      case 'text': /* falls through */
      case 'json': response = parseJSON('response' in xhr ? xhr.response : xhr.responseText); break;
      default: response = xhr.response;
      }
        
      if (xhr.status >= 200 && xhr.status < 300) {
        callback(null, response);
      } else {
        callback(xhrData(xhr, response), null);
      }
    },
    // TODO: retry count depending on status?
    'error': failed,

    'abort': failed
    // TODO: timeout/progress events are useful.
  });

  if (!responseType) {
    // Most responses are JSON responses.
    responseType = 'json';
    xhrMaybeJSON(xhr);
  } else {
    try {
      xhr.responseType = responseType;
    } catch (e) {
      return callback(e, null);
    }
  }
  xhr._responseType = responseType;

  xhr.open(method, url);

  inbox.forEachRequestHeader(xhr.setRequestHeader, xhr);

  xhr.send(data);
}


/**
 * @function
 * @name apiRequestPromise
 * @private
 *
 * @description
 * Simple wrapper for apiRequest() which returns a Promise instead of using a callback.
 * Useful for simple methods which do not need to check the cache before running.
 *
 * @param {InboxAPI} inbox the InboxAPI instance, used for its http configuration
 * @param {string} method the request method
 * @param {string} url the URL to route the HTTP request
 * @param {string|object=} data the data to send, defaults to null
 * @param {function(object)} callback function to be invoked when the request is loaded, can
 *   transform the response.
 *
 * @returns {Promise} a promise to be fulfilled with the response from the server.
 */
function apiRequestPromise(inbox, method, url, data, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = null;
  } else if (typeof data !== 'string') {
    data = null;
  }
  if (typeof callback !== 'function') {
    callback = valueFn;
  }

  return inbox.promise(function(resolve, reject) {
    apiRequest(inbox, method, url, data, function(err, value) {
      if (err) return reject(err);
      return resolve(callback(value));
    });
  });
}
