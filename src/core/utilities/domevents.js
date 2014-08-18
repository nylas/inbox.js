/**
 * @function
 * @name addListener
 * @private
 *
 * @description
 * Adds an event listener to a DOM object.
 *
 * @param {object} object target of the event (DOM object)
 * @param {string} event name of the event, such as 'load'.
 * @param {function} handler callback to be invoked in response to the event.
 */
var addListener = (function() {
  if (typeof window.addEventListener === 'function') {
    return function addEventListener(object, event, handler) {
      return object.addEventListener(event, handler);
    };
  } else if (typeof window.attachEvent === 'function') {
    return function attachEventListener(object, event, handler) {
      return object.attachEvent('on' + event, handler);
    };
  } else {
    return function addListenerUnavailable(object, event) {
      throw new TypeError('Unable to add event listener "' + event + '" to object ' + object +
                          ': addEventListener and attachEvent are unavailable');
    };
  }
})();


/**
 * @function
 * @name removeListener
 * @private
 *
 * @description
 * Removes an event listener to a DOM object.
 *
 * @param {object} object target of the event (DOM object)
 * @param {string} event name of the event, such as 'load'.
 * @param {function} handler callback to remove from the target's handlers for the event.
 */
var removeListener = (function() {
  if (typeof window.addEventListener === 'function') {
    return function removeEventListener(object, event, handler) {
      return object.removeEventListener(event, handler);
    };
  } else if (typeof window.attachEvent === 'function') {
    return function detachEvent(object, event, handler) {
      return object.detachEvent('on' + event, handler);
    };
  } else {
    return function removeListenerUnavailable(object, event) {
      throw new TypeError('Unable to add event listener "' + event + '" to object ' + object +
                          ': removeEventListener and detachEvent are unavailable');
    };
  }
})();


/**
 * @function
 * @name addListeners
 * @private
 *
 * @description
 * For each key/value in object 'listeners', add an event listener for 'key', whose value is the
 * handler.
 *
 * @param {object} object target of the event (DOM object)
 * @param {object} listeners object whose keys are event names, and whose values are handlers
 *    for the respective event name.
 */
function addListeners(object, listeners) {
  var key;
  for (key in listeners) {
    if (listeners.hasOwnProperty(key) && typeof listeners[key] === 'function') {
      addListener(object, key, listeners[key]);
    }
  }
}
