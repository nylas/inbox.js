/**
 * @function
 * @name isArray
 * @private
 *
 * @description
 * Test if a given value is an Array. If Array.isArray is supported, it's possible to test if
 * a value from a different sandbox is an array, but this should not be depended on. The native
 * implementation is primarily deferred to for performance reasons, and nothing else.
 *
 * @param {*} arr value to test if it is an array.
 *
 * @returns {boolean} true if the value is an array, otherwise false.
 */
var isArray = (function() {
  if (typeof Array.isArray === 'function') {
    return Array.isArray;
  }
  return function(arr) {
    return Object.prototype.toString.call(arr) === '[object Array]';
  };
})();


/**
 * @function
 * @name isFile
 * @private
 *
 * @description
 * Returns true if value.toString() results in [object File]. It is possible to get false positives
 * this way, but unlikely.
 *
 * @param {object} obj value to test if it is a File object.
 *
 * @returns {boolean} true if the value is determined to be a File, otherwise false.
 */
function isFile(obj) {
  return obj && Object.prototype.toString.call(obj) === '[object File]';
}

var BLOB_REGEXP = /^\[object (Blob|File)\]$/;


/**
 * @function
 * @name isBlob
 * @private
 *
 * @description
 * Returns true if value.toString() results in [object File] or [object Blob]. It is possible to
 * get false positives this way, but unlikely.
 *
 * Since this would also detect File objects, one should be careful when using this.
 *
 * @param {object} obj value to test if it is a File object.
 *
 * @returns {boolean} true if the value is determined to be a File or Blob, otherwise false.
 */
function isBlob(obj) {
  return obj && BLOB_REGEXP.test(Object.prototype.toString.call(obj));
}
