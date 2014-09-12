var tap = require('../tap');

tap.count(3);

function a (a, b, c, d, e) { }
tap.eq(a.length, 5, 'function arity == 5')
tap.ok(new Function(), 'empty Function() constructor')

try {
  var b = new Function("a", "b", "console.log('')")
  tap.ok(false, 'new Function() does not throw error')
} catch(err) {
  tap.ok(true, 'new Function(arg) throws error')
}
