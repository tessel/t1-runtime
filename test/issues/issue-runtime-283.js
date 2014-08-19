var tap = require('../tap')

tap.count(3)

var a = [1];
var o = {};
var g = global || this;
var result = 0;

/**
 *
 * callbackfn parameters:
 *
 * 1. Value
 * 2. Index
 * 3. The Object
 *
 * + optional thisArg
 *
 * `this` will be whatever the global object is,
 * unless explicitly specified.
 *
 */

a.forEach(function(value, index, object) {
  if (value === 1) {
    result++;
  }

  if (index === 0) {
    result++;
  }

  if (object === a) {
    result++;
  }

  if (this === o) {
    result++;
  }
}, o);

a.forEach(function(value, index, object) {
  if (this === g) {
    result++;
  }
});

var mapped = a.map(function(value, index, object) {
  if (value === 1) {
    result++;
  }

  if (index === 0) {
    result++;
  }

  if (object === a) {
    result++;
  }

  if (this === o) {
    result++;
  }

  return value;
}, o);

a.map(function(value, index, object) {
  if (this === g) {
    result++;
  }
});

a.some(function(value, index, object) {
  if (value === 1) {
    result++;
  }

  if (index === 0) {
    result++;
  }

  if (object === a) {
    result++;
  }

  if (this === o) {
    result++;
  }
}, o);

a.some(function(value, index, object) {
  if (this === g) {
    result++;
  }
});


var filtered = a.filter(function(value, index, object) {
  if (value === 1) {
    result++;
  }

  if (index === 0) {
    result++;
  }

  if (object === a) {
    result++;
  }

  if (this === o) {
    result++;
  }

  return true;
}, o);

a.filter(function(value, index, object) {
  if (this === g) {
    result++;
  }
});

// This will pass when forEach thisArg is implemented
// and default this is corrected. The value of `result`
// is currently 18.
tap.eq(result, 20);
tap.eq(mapped[0], 1);
tap.eq(filtered[0], 1);
