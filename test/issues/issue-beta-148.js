var tap = require('../tap');

tap.count(1);

var b = new Date()
var a = +b
tap.eq(a, b.valueOf());
console.log('#', a)
console.log('#', b.valueOf())