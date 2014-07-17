if (!Object.create) {
  var objectCreateConstructor = function() {};
}


/**
 * @function
 * @name inherits
 * @private
 *
 * @description
 * Private helper method causes a child class to prototypically inherit from a parent class.
 *
 * NOTE: Calling this method on a function will overwrite the child class' original prototype.
 * It should be called before any prototype methods have been defined.
 *
 * @param {function} childClass the child class which extends or augments the superClass.
 * @param {function} superClass the base class from which childClass will inherit.
 */
function inherits(childClass, superClass) {
  if (Object.create) {
    childClass.prototype = Object.create(superClass.prototype);
  } else {
    objectCreateConstructor.prototype = superClass.prototype;
    childClass.prototype = new objectCreateConstructor();
  }
  defineProperty(childClass.prototype, 'super', INVISIBLE, null, null, superClass);
  defineProperty(childClass, 'super', INVISIBLE, null, null, superClass);
  defineProperty(childClass.prototype, 'constructor', INVISIBLE, null, null, childClass);
}
