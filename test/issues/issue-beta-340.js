var tap = require('../tap');

tap.count(4);

console.log('#', 0 && true)
tap.ok(!(0 && true), '0 should short-circuit truthiness');

var a = 0;
console.log('#', a && true)
tap.ok(!(a && true), '0 var should short-circuit truthiness');

console.log('#', 0 || 42)
tap.ok((0 || 42) == 42, '0 should short-circuit falsiness');

var a = 0;
console.log('#', a || 42)
tap.ok((a || 42) == 42, '0 var should short-circuit falsiness');
