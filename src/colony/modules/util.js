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

function isNull (arg) {
  return arg == null;
}

function isObject (arg) {
  return typeof arg == 'object';
}

function isArray (arg) {
  return Array.isArray(arg);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

var debugs = {};
var debugEnviron = process.env.NODE_DEBUG || '';

function debuglog(set) {
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = util.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Public API
 */

exports.inherits = inherits;
exports.deprecate = deprecate;
exports.isString = isString;
exports.isNull = isNull;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isFunction = isFunction;
exports.debuglog = debuglog;
