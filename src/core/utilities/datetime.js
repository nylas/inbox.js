var Now = (function() {
  if (typeof Date.now === "function") {
    return Date.now;
  } else {
    return function() {
      return (new Date()).getTime();
    };
  }
})();

var DateParse = (function() {
  if (typeof Date.parse === "function") {
    return Date.parse;
  } else {
    return function(dateString) {
      return (new Date(dateString)).getTime();
    };
  }
})();

function ToUnixTimestamp(date) {
  var timestamp;
  if (typeof date === "number") {
    return date;
  } else if (typeof date === "string") {
    // if Number(date) is not NaN, then we can treat it as a timestamp ---
    // Otherwise, see if Date can parse it, and use the Date timestamp.
    timestamp = Number(date);
    if (timestamp !== timestamp) {
      timestamp = DateParse(date);
    }
    // May be NaN
    return timestamp;
  } else if (typeof date === "object") {
    // It might be a Moment.js date, or a real Date, or something in between.
    // If the object isn't recognized, try to use the results of toString()
    // and parse it as a string.
    if (date instanceof Date) {
      return date.getTime();
    } else if (typeof (timestamp = date.toString()) === "string") {
      return ToUnixTimestamp(timestamp);
    }
  }

  // If we get this far, then it's not clear what to do with it.
  return Now();
}
