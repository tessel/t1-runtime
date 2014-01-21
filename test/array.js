// test rig
var t = 1, tmax = 7;
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);

function eq (a, b) {
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

var a = [1];
a.splice(0, 1);
ok(eq(a, []));

var a = [1, 2, 3];
a.splice(1, 1);
ok(eq(a, [1, 3]));

var a = [2, 3];
a.unshift(1);
ok(eq(a, [1, 2, 3]))

var a = [];
a.unshift(1);
ok(eq(a, [1]))

ok([0, 0, 0, 0, 0, 0].length == 6);
ok(eq([0, 1, 2, 3, 4, 5].slice(0, 5), [0, 1, 2, 3, 4]))
ok(eq([0, 0, 0, 0, 0, 0].slice(0, 5), [0, 0, 0, 0, 0]));