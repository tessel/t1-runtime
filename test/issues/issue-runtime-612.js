var tap = require('../tap');

tap.count(1);

var a = 5
var b = (11 >>> 0)
a = b || 0
tap.eq(a, 11, 'assignment of float to slot is ok')
