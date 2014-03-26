/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

function arreq (a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (var i = 0; i < a.length; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}


var header = [0x02, 0x02, 0x00];
var data = new Array(0x02);
ok(header.concat(data).length == 5, 'array concat length')
console.log('# -->', header.concat(data).length)
ok(arreq(header.concat(data), [2, 2, 0, undefined, undefined]), 'array concat')
console.log('#', header.concat(data))
ok([2, 2, 0, undefined, undefined].length == 5, 'array length');
console.log('#', [2, 2, 0, undefined, undefined].length);