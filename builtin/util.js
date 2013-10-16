/**
 * util.inherits
 */

function inherits (A, B) {
  var f = function () { };
  f.prototype = B.prototype;
  A.prototype = new f();
}

function deprecate (fn) {
  return fn;
}

function isString (str) {
  return typeof str == 'string';
}


/**
 * Public API
 */

exports.inherits = inherits;
exports.deprecate = deprecate;
exports.isString = isString;