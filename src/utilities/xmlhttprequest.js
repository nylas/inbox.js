var IE8_METHODS = /^(get|post|head|put|delete|options)$/i;

function XHRForMethod(method) {
  if (document.documentMode <= 8 && (method.match(IE8_METHODS) || !XHR)) {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } else if (window.XMLHttpRequest) {
    return new window.XMLHttpRequest();
  }
  return null;
}

function XHRMaybeJSON(xhr) {
  try {
    xhr.responseType = 'json';
  } catch(e) {
    // Safari 7 does not support the 'json' responseType, but supports the
    // responseType property, which will throw if passed an unsupported
    // DOMString value.
  }
}

function XHRData(xhr, response) {
  return {
    status: xhr.status,
    statusText: xhr.statusText,
    data: response,
    headers: ParseResponseHeaders(xhr)
  };
}

function RejectXHR(reject, xhr, type) {
  return function() {
    var response = null;
    if (type === 'json') {
      response = ParseJSON('response' in xhr ? xhr.response : xhr.responseText);
    }
    reject(XHRData(xhr, response));
  };
}

function ParseResponseHeaders(xhr) {
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
      headers[key] = val;
    }
  }
  return headers;
}
