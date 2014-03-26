/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

try {
	throw Error("Test");
	ok(false)
} catch (e) {
	ok(true)
}

ok(Error("Test").message)