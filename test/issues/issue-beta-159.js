// Strings should not automatically be coerced to numbers in arithmetic
// but tonumber() should continue to coerce strings

var tap = require('../tap');

tap.count(2);

var elem = "2";
tap.eq("0" + elem, '02');
console.log('#', '0' + elem)

var n = Number("55");
tap.eq(n, 55);
console.log('#', n);
