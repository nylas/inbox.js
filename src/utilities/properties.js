var INVISIBLE = 1;
var CONFIGURABLE = 2;
var WRITABLE = 4;

function DefineProperty(object, name, flags, get, set, value) {
  if (Object.defineProperty) {
    var defn = {
      enumerable: !(flags & INVISIBLE),
      configurable: !!(flags & CONFIGURABLE),
      writable: !!(flags & WRITABLE)
    };
    if (typeof get === "function") {
      defn.get = get;
      if (typeof set === "function") {
        defn.set = set;
      }
    } else if (arguments.length > 5) {
      defn.value = value;
    }
    Object.defineProperty(object, name, defn);
  }
}
