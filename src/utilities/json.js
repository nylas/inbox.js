var ParseJSON = (function() {
  if (window.JSON && typeof window.JSON.parse === "function") {
    return function(maybeJSON, replacer, indent) {
      if (typeof maybeJSON === "string") {
        return JSON.parse(maybeJSON, replacer, indent);
      } else {
        return maybeJSON;
      }
    };
  } else {
    return function(maybeJSON) {
      throw new TypeError("Cannot perform 'ParseJSON' on " + maybeJSON + ": JSON.stringify not " +
                          "available.");
    };
  }
})();
