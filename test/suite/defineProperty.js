/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);

o = {};

Object.defineProperty(o, 'foo', {
  value: 0,
});

ok(o.foo + 1 === 1, 'falsy value');

Object.defineProperty(o, 'bar', {
  get: function() { return 5; }
});

ok(o.bar === 5, 'getter');
