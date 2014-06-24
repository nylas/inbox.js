var AddListener = (function() {
  if (typeof window.addEventListener === "function") {
    return function addEventListener(object, event, handler) {
      return object.addEventListener(event, handler);
    };
  } else if (typeof window.attachEvent === "function") {
    return function attachEventListener(object, event, handler) {
      return object.attachEvent('on'+event, handler);
    };
  } else {
    return function addListenerUnavailable(object, event) {
      throw new TypeError("Unable to add event listener '" + event + "' to object " + object +
                          ": addEventListener and attachEvent are unavailable");
    };
  }
})();

var RemoveListener = (function() {
  if (typeof window.addEventListener === "function") {
    return function removeEventListener(object, event, handler) {
      return object.removeEventListener(event, handler);
    };
  } else if (typeof window.attachEvent === "function") {
    return function detachEvent(object, event, handler) {
      return object.detachEvent('on'+event, handler);
    };
  } else {
    return function removeListenerUnavailable(object, event) {
      throw new TypeError("Unable to add event listener '" + event + "' to object " + object +
                          ": removeEventListener and detachEvent are unavailable");
    };
  }
})();

function AddListeners(object, listeners) {
  var key;
  for (key in listeners) {
    if (listeners.hasOwnProperty(key) && typeof listeners[key] === "function") {
      AddListener(object, key, listeners[key]);
    }
  }
}
