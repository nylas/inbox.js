;(function (window) {
  'use strict';

  var toContainObject = {
    toContainObject: function(expected) {
      var mismatchKeys = [],
        mismatchValues = [],
        not = this.isNot,
        actual = this.actual,
        objectContaining = jasmine.objectContaining(expected);

      function notMatch (mismatchKeys, mismatchValues) {
        var env = jasmine.getEnv();

        var hasKey = function(obj, keyName) {
          return obj != null && obj[keyName] !== jasmine.undefined;
        };

        for (var property in expected) {
          var keysMatch = hasKey(actual, property) && hasKey(expected, property),
            propertiesMatch = env.equals_(expected[property], actual[property], mismatchKeys, mismatchValues);

          if (keysMatch && propertiesMatch) {
            var message = 'expected: ' + jasmine.pp(expected) + ' and actual: ' + jasmine.pp(actual) + ' have matching \'' + property + '\' value.';

            mismatchValues.push(message);
          }
        }
      }

      this.message = function () {
        if (not)
          notMatch(mismatchKeys, mismatchValues);

        return mismatchKeys.concat(mismatchValues).join('\n');
      };

      return objectContaining
        .jasmineMatches(this.actual, mismatchKeys, mismatchValues);
    }
  };

  beforeEach(function() {
    this.addMatchers(toContainObject);
  });
}(this));
