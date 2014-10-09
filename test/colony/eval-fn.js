// Colony does not yet support parsing in eval() or in
// Function constructor. Helpfully, throw an error instead.

var tap = require('../tap');

tap.count(1);

try {
  var b = new Function("a", "b", "console.log('')")
  tap.ok(false, 'new Function() does not throw error')
} catch(err) {
  tap.ok(true, 'new Function(arg) throws error')
}
