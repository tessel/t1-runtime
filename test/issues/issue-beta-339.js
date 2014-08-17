var tap = require('../tap');

tap.count(1);

var b = Buffer([1,2,3,4,5,6]).slice(1,-2);
console.log('#', b);
tap.eq(b.length, 3, 'buffer.slice accepts negative indices');