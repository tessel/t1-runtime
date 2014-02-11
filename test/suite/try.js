/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var e = null;
try {
	throw "BOO";
} catch (e) { }
ok(e == null, 'error should not escape scope of try #TODO')