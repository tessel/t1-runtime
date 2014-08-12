var tap = require('../tap');

tap(2);

var a = Date.now();
var b = new Date(a);

tap.eq(a, b.getTime());
tap.eq(a, b.valueOf());
