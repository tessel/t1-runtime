var tap = require('../tap');

tap.count(2);

var s = '42',
    n = +s;
tap.ok(n, 42);
tap.eq(typeof n, 'number');
console.log('#', n, typeof n);
