/**
 * @function
 * @name now
 * @private
 *
 * @description
 * Returns the current unix timestamp (milliseconds elapsed since the epoch,
 * 1 January 1970 00:00:00 UTC.). If Date.now is unavailable, a polyfill is used instead.
 *
 * @returns {number} The current unix timestamp (milliseconds elapsed since the epoch).
 */
var Now = (function() {
  if (typeof Date.now === 'function') {
    return Date.now;
  } else {
    return function() {
      return (new Date()).getTime();
    };
  }
})();


/**
 * @function
 * @name parseDate
 * @private
 *
 * @description
 * Parses a string, and returns the unix timestamp. If the date string contains a timezone, then
 * the result is in that timezone. Otherwise, it is in UTC. If Date.parse is not available, then
 * the parsed value is instead the result of `(new Date(dateString)).getTime()`, which can
 * behave somewhat differently.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
 * for details.
 *
 * @param {string} dateString value to parse as a date.
 *
 * @returns {number} The unix timestamp for the parsed date, possibly NaN.
 */
var parseDate = (function() {
  if (typeof Date.parse === 'function') {
    return Date.parse;
  } else {
    return function(dateString) {
      return (new Date(dateString)).getTime();
    };
  }
})();


/**
 * @function
 * @name toUnixTimestamp
 * @private
 *
 * @description
 * Convert a value into a timestamp understood by the Inbox filtering API.
 *
 * The filtering API understands timestamps in terms of seconds since the epoch, presumably in UTC.
 * Since JavaScript deals in milliseconds since the epoch, it's necessary to truncate the number.
 * Currently this is done by dividing the timestamp by 1000 and truncating the fractional part.
 *
 * @param {*} date the value representing a given date. Hopefully this is an ES5-compatible Date
 *   object, or it's possible to have some problems.
 *
 * @returns {number} a truncated number representing seconds since the epoch, in some unguaranteed
 *   timestamp. May return NaN if a value could not be converted to a number.
 */
function toUnixTimestamp(date) {
  var timestamp;
  if (typeof date === 'number') {
    return date;
  } else if (typeof date === 'string') {
    // if Number(date) is not NaN, then we can treat it as a timestamp ---
    // Otherwise, see if Date can parse it, and use the Date timestamp.
    timestamp = Number(date);
    if (timestamp !== timestamp) {
      timestamp = parseDate(date);
      if (timestamp !== timestamp) return timestamp;
      timestamp = (timestamp / 1000) >>> 0;
    }
    // May be NaN
    return timestamp;
  } else if (typeof date === 'object') {
    // It might be a Moment.js date, or a real Date, or something in between.
    // If the object isn't recognized, try to use the results of toString()
    // and parse it as a string.
    if (date instanceof Date) {
      return (date.getTime() / 1000) >>> 0;
    } else if (typeof (timestamp = date.toString()) === 'string') {
      return toUnixTimestamp(timestamp);
    }
  }

  // If we get this far, then it's not clear what to do with it. Just return NaN so the item is
  // removed from filters.
  return NaN;
}
