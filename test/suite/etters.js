var tap = require('../tap');

tap.count(8);

var a = {}
a.hello = 'A'
tap.ok(a.hello == 'A', 'normal property getter')
Object.defineProperties(a, {
  'hello': {
    get: function () {
      return 'B';
    }
  }
});
a.__defineSetter__('hello', function (val) {
  tap.ok(true, 'called setter');
});
tap.ok(a.hello == 'B', 'getter defined');
a.hello = 'C'
tap.ok(a.hello == 'B', 'setter worked');

var b = {};
b.hello = 'A';
tap.ok(b.hello == 'A', 'normal property getter');
b.__defineSetter__('hello', function (val) {
  tap.ok(true, 'setter without getter worked')
});
tap.ok(b.hello == null, 'setter removed value #TODO')
b.hello = 'B';
tap.ok(b.hello != 'B', 'setter didnt change value')