var tap = require('../tap');

tap.count(2);

o = {};

Object.defineProperty(o, 'foo', {
  value: 0,
});

tap.ok(o.foo + 1 === 1, 'falsy value');

Object.defineProperty(o, 'bar', {
  get: function() { return 5; }
});

tap.ok(o.bar === 5, 'getter');
