/* test rig */ var t = 1, tmax = 7
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);

var a = {x: 5}
ok(a.hasOwnProperty('x') === true, 'object hasOwnProperty positive')
ok(a.hasOwnProperty('y') === false, 'object hasOwnProperty negative')
ok(a.hasOwnProperty('hasOwnProperty') === false, 'object hasOwnProperty prototype')

var f = function(){};
f.foo = 1
ok(f.hasOwnProperty('foo') === true, 'function hasOwnProperty positive')
ok(f.hasOwnProperty('bar') === false, 'function hasOwnProperty negative')

var b = new Buffer(1);
b.foo = 1;
ok(b.hasOwnProperty('foo') === true, 'buffer hasOwnProperty positive')
ok(b.hasOwnProperty('bar') === false, 'buffer hasOwnProperty negative')

var s = 'string';
ok(s.hasOwnProperty('length') === true, 'string hasOwnProperty positive')
ok(s.hasOwnProperty('bar') === false, 'string hasOwnProperty negative')
