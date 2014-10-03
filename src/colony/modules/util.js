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
  return arg === null;
}

function isUndefined (arg) {
  return typeof arg == 'undefined';
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

// NOTE/TODO: this one is probably a good candidate for copy-pasta'ing out of joyent/node sources?
function inspect(obj, opts) {
  opts = extend({
    showHidden: false,
    depth: 2,
    colors: false,    // TODO: colors not supported
    customInspect: true,
    _: {depth:0,parents:[obj]}
  }, opts);
  
  function recurse(obj) {
    if (~opts._.parents.indexOf(obj)) return shortString(obj, 'Circular');
    else opts._.parents.push(obj);
    ++opts._.depth;
    obj = inspect(obj, opts);
    --opts._.depth;
    opts._.parents.pop();
    return obj;
  }
  function indent(n, s) {
    var t = '\n';
    while (n-->0) t += ' ';
    return t+s;
  }
  function shortString(obj, typeName) {
    switch (typeName) {
      case 'Undefined':
      case 'Boolean':
      case 'Number':
      case 'String':
      case 'RegExp':
      case 'Date':
      case 'Null':
        return ''+obj;
      default:
        return '['+typeName+']';
    }
  }
  
  var typeName = objectToString(obj).slice('[object '.length, -1);
  if (typeof obj === 'userdata') {       // gracefully handle any situations like https://github.com/tessel/runtime/issues/305
    typeName = 'Userdata';
  }
  if (opts._.depth > opts.depth || isNullOrUndefined(obj) || typeName === 'Userdata') return shortString(obj, typeName);
  else if (opts.customInspect && typeof obj.inspect === 'function') return obj.inspect();
  else {
    if (typeName === 'Array') return '[ '+obj.map(recurse).join(', ')+' ]';
    else if (typeName === 'Object' || typeName === 'Arguments') return '{' +
      Object[(opts.showHidden) ? 'getOwnPropertyNames' : 'keys'](obj).map(function (k) {
        return indent(opts._.depth+1, k +' : '+recurse(obj[k]));
      }).join(',') + indent(opts._.depth, '}');
    else return ''+obj;
  }
}


function format(fmt) {
  var arr = [], args = arguments, i = 0;

  // Format string.
  if (typeof fmt == 'string' && fmt.indexOf('%') > -1) {
    i = 1;
    arr[arr.length] = fmt.replace(/%[sdj%]/g, function (m) {
      if (i >= args.length)
        return (m[1] === '%') ? '%' : m;
      var arg = args[i]
      i = i + 1;
      switch (m[1]) {
        case '%': return "%";
        case 's': return arg;
        case 'd': return Number(arg);
        case 'j': return JSON.stringify(arg);
      }
    });
  }

  // Normal arguments.
  while (i < args.length) {
    var a = args[i], t = typeof a;
    if (t == 'boolean' || t == 'number' || t == 'string' || t == 'undefined') {
      arr[arr.length] = a;
    } else {
      arr[arr.length] = inspect(a);
    }
    i = i + 1;
  }
  return arr.join(' ');
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
exports.inspect = inspect;
exports.format = format;
exports.isNullOrUndefined = isNullOrUndefined;
exports.isUndefined = isUndefined;
exports.debuglog = debuglog;

/**
 * Non-public API (but that doesn't stop some people)
 */

exports._extend = extend;
