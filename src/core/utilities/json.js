/**
 * @function
 * @name toJSON
 * @private
 *
 * @description
 * Stringify an object. Technically, it's possible to stringify strings, but this use case is not
 * supported here.
 *
 * This requires the JSON object to be available. If it's not available, consider using a
 * polyfill such as http://bestiejs.github.io/json3/
 *
 * @param {object} maybeJSON value to stringify as JSON.
 * @param {function=} replacer optional callback for replacing values.
 * @param {number=} indent optional indent value, for printing JSON in a pretty fashion. Unused
 *   by the framework, but may be used to assist in debugging in the future.
 *
 * @returns {string} the stringified JSON, or unstringified string or function if maybeJSON is
 *   not an acceptable type.
 */
var toJSON = (function() {
  if (window.JSON && typeof window.JSON.stringify === 'function') {
    return function(maybeJSON, replacer, indent) {
      if (typeof maybeJSON !== 'string' && typeof maybeJSON !== 'function') {
        return JSON.stringify(maybeJSON, replacer, indent);
      } else {
        return maybeJSON;
      }
    };
  } else {
    return function(maybeJSON) {
      throw new TypeError("Cannot perform 'toJSON' on " + maybeJSON + ": JSON.stringify not " +
                          "available.");
    };
  }
})();


/**
 * @function
 * @name parseJSON
 * @private
 *
 * @description
 * Parse a JSON string to a value.
 *
 * This requires the JSON object to be available. If it's not available, consider using a
 * polyfill such as http://bestiejs.github.io/json3/
 *
 * @param {string} json the JSON string to parse
 * @param {function=} reviver optional reviver, unused by the framework.
 *
 * @returns {object|string|number} the parsed JSON value.
 */
var parseJSON = (function() {
  if (window.JSON && typeof window.JSON.parse === 'function') {
    return function(json, reviver) {
      if (typeof json === 'string') {
        if (typeof reviver !== 'function') reviver = null;
        return JSON.parse(json, reviver);
      }
      return json;
    };
  } else {
    return function(json) {
      throw new TypeError("Cannot perform 'parseJSON' on " + json + ": JSON.parse not " +
                          "available.");
    };
  }
})();
