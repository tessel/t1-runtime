var tap = require('../tap');

tap.count(6)

var n = 42
tap.ok(n.toFixed(0), '42', 'toFixed(0) works')
tap.ok(n.toFixed(5), '42.00000', 'toFixed(5) works')
tap.ok(n.toFixed(), '42', 'toFixed() works')
tap.ok(n.toFixed(null), '42', 'toFixed(null) works')
tap.ok(n.toFixed(''), '42', 'toFixed("") works')
tap.ok(n.toFixed(false), '42', 'toFixed(false) works')
