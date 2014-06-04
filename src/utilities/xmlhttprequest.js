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
