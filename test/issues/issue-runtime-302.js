var tap = require('../tap');

var tests = [
  [function fn() { return ref; }, 'Function', 'function'],
  [Buffer([1,2,3]), 'Object', 'object'],
  [new Date(), 'Date', 'object'],
  [/abc/g, 'RegExp', 'object'],
  [new Error('baaaa'), 'Error', 'object'],
  [void 0, 'Undefined', 'undefined'],
  [true, 'Boolean', 'boolean'],
  // [null, 'Null', 'object'],
  ['a', 'String', 'string'],
  [42, 'Number', 'number'],
  [[], 'Array', 'object'],
  [(function () { return arguments; })(), 'Arguments', 'object']
];

tap(tests.length * 2);

tests.forEach(function (d) {
  console.log('#', d[0])
  tap.eq(Object.prototype.toString.call(d[0]), '[object ' + d[1] + ']', 'Object.prototype.toString');
  tap.eq(typeof d[0], d[2], 'typeof');
});
