var tap = require('../tap')

tap.count(2)

var a = [];
tap.eq(a.length, 0);
a.sort(function(a, b) {return a.foo - b.foo});
console.log('#', a);
tap.eq(a.length, 0);
