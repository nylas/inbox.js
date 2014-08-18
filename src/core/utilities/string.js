/**
 * @function
 * @name formatString
 * @private
 *
 * @description
 * Given a template string, replace each `%@` in the string with a stringified value (arguments
 * following the template).
 *
 * E.G, formatString('%@, %@!', 'Hello', 'World') -> 'Hello, World!'
 *
 * @param {string} template the string template to process.
 * @param {...*} args values to replace the instances of `%@` in the template string.
 *
 * @returns {string} the processed string.
 */
function formatString(template, args) {
  var i = 0, ii;
  args = Array.prototype.slice.call(arguments, 1);
  ii = args.length;
  return template.replace(/\%\@/g, function() {
    if (i < ii) {
      return '' + args[i++];
    }
    return '';
  });
}


/**
 * @function
 * @name endsWith
 * @private
 *
 * @description
 * Returns true if a string ends with a given search, otherwise false.
 *
 * @param {string} str target string which is tested to see if it ends with the search string
 * @param {string} search string to sesarch for at the end of the target string.
 *
 * @returns {boolean} true if the target string ends with the search string, otherwise false
 */
function endsWith(str, search) {
  if (typeof str === 'undefined') str = '';
  str = '' + str;
  var position = str.length;
  position -= search.length;
  var lastIndex = str.indexOf(search, position);
  return lastIndex !== -1 && lastIndex === position;
}

var CAPITALIZE_STRING_REGEXP = /(^.)|(\s.)/g;
function capitalizeStringReplacer(c) {
  return c.toUpperCase();
}


/**
 * @function
 * @name capitalizeString
 * @private
 *
 * @description
 * Capitalize each word in a string, similar to [NSString capitalizedString] in Foundation.
 *
 * @param {string} str the string to capitalize
 *
 * @returns {string} the string, with the first letter of each word capitalized.
 */
function capitalizeString(str) {
  // Based on NSString#capitalizeString()
  return ('' + str).replace(CAPITALIZE_STRING_REGEXP, capitalizeStringReplacer);
}
