var INVISIBLE = 1;
var CONFIGURABLE = 2;
var WRITABLE = 4;


/**
 * @function
 * @name hasProperty
 * @private
 *
 * @description
 * Helper for invoking Object#hasOwnProperty. Older versions of IE have issues calling this on DOM
 * objects, and it's also possible to invoke hasOwnProperty on functions using this.
 *
 * @param {object|function} obj the object to test for the presence of propertyName
 * @param {string} propertyName the property name to test for.
 *
 * @returns {boolean} true if the target object has own property `propertyName`, otherwise false.
 */
function hasProperty(obj, propertyName) {
  if (obj === null || obj === undefined) {
    return false;
  }
  return (obj.hasOwnProperty && obj.hasOwnProperty(propertyName)) ||
          Object.prototype.hasOwnProperty.call(obj, propertyName);
}


/**
 * @function
 * @name defineProperty
 * @private
 *
 * @description
 * Helper for defining properties. Typically used for defining data properties, but also enables
 * defining getters/setters, though these are not currently used by the framework.
 *
 * Flags:
 *   1. INVISIBLE --- If specified, the property is non-enumerable
 *   2. CONFIGURABLE --- If specified, the property is configurable
 *   3. WRITABLE --- If specified, the property is writable
 *
 * @param {object|function} object the target object on which to define properties.
 * @param {string} name the property name to define.
 * @param {numnber} flags flags --- any bitwise combination of INVISIBLE (1), CONFIGURABLE (2), or
 *   WRITABLE (4), or 0 for none of the above.
 * @param {function} get a function to invoke for getting a property. Not supported in old browsers.
 * @param {function} set a function to invoke for setting a property value. Not supported in old
 *   browsers.
 * @param {*} value If specified, it is a data value for the property.
 */
function defineProperty(object, name, flags, get, set, value) {
  if (Object.defineProperty) {
    var defn = {
      enumerable: !(flags & INVISIBLE),
      configurable: !!(flags & CONFIGURABLE),
      writable: !!(flags & WRITABLE)
    };
    if (typeof get === 'function') {
      defn.get = get;
      if (typeof set === 'function') {
        defn.set = set;
      }
    } else if (arguments.length > 5) {
      defn.value = value;
    }
    Object.defineProperty(object, name, defn);
  } else {
    if (typeof get === 'function') {
      object[name] = get();
    } else if (arguments.length > 5) {
      object[name] = value;
    }
  }
}
