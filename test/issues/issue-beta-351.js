var tap = require('../tap');

tap.count(1);

var a = [];
a.push('foo');
tap.eq(a.pop(), 'foo');
