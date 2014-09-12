var tap = require('../tap');

tap.count(1);

var b = Buffer([1,2,3]).slice(3,50);
console.log('#', b);
tap.eq(b.length, 0, 'buffer.slice does not read past end.');
