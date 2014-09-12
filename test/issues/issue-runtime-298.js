var tap = require('../tap')

tap.count(4)

console.log('#', parseFloat("x"));
tap.ok(isNaN(parseFloat("x")))

console.log('#', parseInt("x"));
tap.ok(isNaN(parseInt("x")))

console.log('#', Number("x"));
tap.ok(isNaN(Number("x")))

console.log('#', +"x");
tap.ok(isNaN(+"x"))
