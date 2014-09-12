var tap = require('../tap');

tap.count(2);

var buf = new Buffer('test');

console.log('#', JSON.stringify(String.fromCharCode.apply(null, buf)));
tap.eq(String.fromCharCode.apply(null, buf), 'test')
console.log('#', JSON.stringify(String.fromCharCode.apply(null, [])));
tap.eq(String.fromCharCode.apply(null, []), '')
