/* test rig */ var t = 1, tmax = 9
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var a = {}
a.hello = 'A'
ok(a.hello == 'A', 'normal property getter')
Object.defineProperties(a, {
  'hello': {
    get: function () {
      return 'B';
    }
  }
});
a.__defineSetter__('hello', function (val) {
  ok(true, 'called setter');
});
ok(a.hello == 'B', 'getter defined');
a.hello = 'C'
ok(a.hello == 'B', 'setter worked');

var b = {};
b.hello = 'A';
ok(b.hello == 'A', 'normal property getter');
b.__defineSetter__('hello', function (val) {
  ok(true, 'setter without getter worked')
});
ok(b.hello == null, 'setter removed value #TODO')
b.hello = 'B';
ok(b.hello != 'B', 'setter didnt change value')