/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

function a (a, b, c, d, e) { }
ok(a.length == 5, 'function arity == 5')