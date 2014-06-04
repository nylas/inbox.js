var IE8_METHODS = /^(get|post|head|put|delete|options)$/i;
var XHR = window.XMLHttpRequest;

function XHRForMethod(method) {
  if (document.documentMode <= 8 && (method.match(IE8_METHODS) || !XHR) {
    return new window.ActiveXObject("Microsoft.XMLHTTP");
  } else if (XHR) {
    return new XHR();
  }
  return null;
}

function XHRMaybeJSON(xhr) {
  try {
    xhr.responseType = 'json';
  } catch {
    // Safari 7 does not support the 'json' responseType, but supports the
    // responseType property, which will throw if passed an unsupported
    // DOMString value.
  }
}
