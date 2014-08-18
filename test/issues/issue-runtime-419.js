var tap = require('../tap');

tap(1);

var foo = 5;
tap.eq(foo.hasOwnProperty('bar'), false);
