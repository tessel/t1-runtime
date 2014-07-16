/* test rig */ var t = 1, tmax = 4
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

function a (a, b, c, d, e) { }
ok(a.length == 5, 'function arity == 5')
ok(new Function(), 'empty Function() constructor')

try {
  var b = new Function("a", "b", "console.log('')")
  ok(false, 'new Function() does not throw error')
} catch(err) {
  ok(true, 'new Function(arg) throws error')
}
