// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

// Portions Copyright Joyent, Inc. and other Node contributors

/**
 * util.inherits
 */

function inherits (A, B) {
  var f = function () { };
  f.prototype = B.prototype;
  A.prototype = new f();
  A.super_ = B;
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function deprecate (fn) {
  return fn;
}

function isString (str) {
  return typeof str == 'string';
}

function isBuffer (arg) {
  return Buffer.isBuffer(arg);
}

function isNumber (arg) {
  return typeof arg == 'number';
}

function isNull (arg) {
  return arg == null;
}

function isObject (arg) {
  return typeof arg == 'object';
}

function isBoolean(arg) {
  return typeof arg == 'boolean';
}

function isArray (arg) {
  return Array.isArray(arg);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNullOrUndefined(arg) {
  return arg == null;
}

function isDate(arg) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isRegExp(arg) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
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

// TODO: Make it work like Node's inspect
function inspect(object) {
  console.log(object);
}

// NOTE: this is currently just a placeholder within `format` (`inspect` above doesn't even return a string!)
// TODO: make it even more like Node's inspect
function _inspect(obj, opts) {
  if (typeof obj === 'string') return obj;
  else if (typeof obj === 'object' && typeof obj.inspect === 'function') return obj.inspect();
  else return JSON.stringify(obj);
}

function format(fmt) {
  var rev_vals = Array.prototype.slice.call(arguments, 1).reverse();   // (reversed so we can push/pop instead of shift/unshift)
  if (typeof fmt !== 'string') {
    rev_vals.push(fmt);
    fmt = null;
  }
  var str = fmt && fmt.replace(/%[sdj%]/g, function (m) {
    if (!rev_vals.length) return (m[1] === '%') ? '%' : m;
    else switch (m[1]) {
      case '%': return "%";
      case 's': return rev_vals.pop();
      case 'd': return Number(rev_vals.pop());
      case 'j': return JSON.stringify(rev_vals.pop());
    }
  });
  if (rev_vals.length) {
    rev_vals = rev_vals.map(_inspect);
    if (fmt !== null) rev_vals.push(str);
    str = rev_vals.reverse().join(' ');
  }
  return str;
}

function extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || typeof add !== 'object') return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

/**
 * Public API
 */

exports.inherits = inherits;
exports.deprecate = deprecate;
exports.isString = isString;
exports.isBuffer = isBuffer;
exports.isBoolean = isBoolean;
exports.isNumber = isNumber;
exports.isNull = isNull;
exports.isObject = isObject;
exports.isArray = isArray;
exports.isFunction = isFunction;
exports.isDate = isDate;
exports.isRegExp = isRegExp;
exports.dir = exports.inspect = inspect;
exports.format = format;
exports.isNullOrUndefined = isNullOrUndefined;
exports.debuglog = debuglog;

/**
 * Non-public API (but that doesn't stop some people)
 */

exports._extend = extend;
