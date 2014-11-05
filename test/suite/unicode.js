var tap = require('../tap')

tap.count(1)

var a = "\u007a\u2603";
console.log('#', a);

tap.ok(true, 'unicode string can be output');
