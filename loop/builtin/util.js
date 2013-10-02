/**
 * util.inherits
 */

function inherits (A, B) {
  var f = function () { };
  f.prototype = B.prototype;
  A.prototype = new f();
}


/**
 * Public API
 */

exports.inherits = inherits;