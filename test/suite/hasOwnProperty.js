var tap = require('../tap');

tap.count(9);

var a = {x: 5}
tap.eq(a.hasOwnProperty('x'), true, 'object hasOwnProperty positive')
tap.eq(a.hasOwnProperty('y'), false, 'object hasOwnProperty negative')
tap.eq(a.hasOwnProperty('hasOwnProperty'), false, 'object hasOwnProperty prototype')

var f = function(){};
f.foo = 1
tap.eq(f.hasOwnProperty('foo'), true, 'function hasOwnProperty positive')
tap.eq(f.hasOwnProperty('bar'), false, 'function hasOwnProperty negative')

var b = new Buffer(1);
b.foo = 1;
tap.eq(b.hasOwnProperty('foo'), true, 'buffer hasOwnProperty positive')
tap.eq(b.hasOwnProperty('bar'), false, 'buffer hasOwnProperty negative')

var s = 'string';
tap.eq(s.hasOwnProperty('length'), true, 'string hasOwnProperty positive')
tap.eq(s.hasOwnProperty('bar'), false, 'string hasOwnProperty negative')
