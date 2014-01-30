/* test rig */ var t = 1, tmax = 10
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

var a = [];
a.push(1, 2, 3, 4, 5);
ok(a.length == 5, 'array::push accepts multiple args');

var a = [1];
a.splice(0, 1);
ok(arreq(a, []));

var a = [1, 2, 3];
a.splice(1, 1);
ok(arreq(a, [1, 3]));

var a = [2, 3];
a.unshift(1);
ok(arreq(a, [1, 2, 3]))

var a = [];
a.unshift(1);
ok(arreq(a, [1]))

ok([0, 0, 0, 0, 0, 0].length == 6);
ok(arreq([0, 1, 2, 3, 4, 5].slice(0, 5), [0, 1, 2, 3, 4]))
ok(arreq([0, 0, 0, 0, 0, 0].slice(0, 5), [0, 0, 0, 0, 0]));
ok(arreq([0, 1, 2, 3, 4, 5].slice(1), [1, 2, 3, 4, 5]), 'slice(1) returns full array')


var a = new Array(50);
a[20] = 'b';
ok(a.length == 50, 'new Array(50) length is 50 #TODO')

var b = [];
b[20] = 'b';
ok(b.length == 21, 'setting sparse high array index extends array #TODO');

var c = [1, 2, 3];
c[3] = 4;
ok(c.length == 4, 'setting non-sparse high array index extends array');

ok([0, 1, 2, 3].reduce(function(a, b) {
    return a + b;
}) == 6, 'array reduce');

ok(arreq([[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
    return a.concat(b);
}), [0, 1, 2, 3, 4, 5]), 'array reduce with init');