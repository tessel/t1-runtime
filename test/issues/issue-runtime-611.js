var tap = require('../tap');

tap.count(1);

var a = [ 86, 67, 48, 55, 48, 51, 32, 49, 46, 48, 48 ]
var J = 11
var b = a.splice(5, J >>> 0).slice();
tap.eq(b.length, 6, 'splice delete exceding length of string is valid');
