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

var arr = [];
ok(arr.length == 0, 'array::push - length')
arr.push(1, 2, 3, 4, 5);
ok(arr.length == 5, 'array::push - values added, accepts multiple args');

var arr = [1, 2, 3, 4, 5];
ok(arr.length == 5, 'array::pop - length')
ok(arr.pop() == 5, 'array::pop - values popped');
ok(arr.length == 4, 'array::pop - length modified');
var arr = [];
ok(arr.pop() == null, 'array::pop - null values popped');
ok(arr.length == 0, 'array::pop - length unmodified when 0');

var a = [1];
a.splice(0, 1);
ok(arreq(a, []));

var a = [1, 2, 3];
a.splice(1, 1);
ok(arreq(a, [1, 3]));

var a = [2, 3];
a.unshift(1);
ok(arreq(a, [1, 2, 3]))

var arr = [2];
ok(arr.length == 1, 'array::unshift - length')
arr.unshift(1);
ok(arreq(arr, [1, 2]), 'array::unshift - correct')
ok(arr.length == 2, 'array::unshift - unshift redefines length')

var arr = ["adrian", "zankich"];
ok(arr.length == 2, 'array::shift - length')
var first_name = arr.shift();
ok(arr.length == 1, 'array::shift - shift redefines length');
ok(first_name == 'adrian', 'array::shift - shifted value')
var arr = [];
ok(arr.shift() == null, 'array::shift - null values shifted');
ok(arr.length == 0, 'array::shift - length unmodified when 0');

ok([0, 0, 0, 0, 0, 0].length == 6);
ok(arreq([0, 1, 2, 3, 4, 5].slice(0, 5), [0, 1, 2, 3, 4]))
ok(arreq([0, 0, 0, 0, 0, 0].slice(0, 5), [0, 0, 0, 0, 0]));
ok(arreq([0, 1, 2, 3, 4, 5].slice(1), [1, 2, 3, 4, 5]), 'slice(1) returns full array')


var a = new Array(50);
a[20] = 'b';
ok(a.length == 50, 'new Array(50) length is 50')

var b = [];
b[20] = 'b';
ok(b.length == 21, 'setting sparse high array index extends array');

var c = [1, 2, 3];
c[3] = 4;
ok(c.length == 4, 'setting non-sparse high array index extends array');

var a = [1,2,3];
console.log("# array full:", a, a.length);
ok(a.length == 3);
a[0] = undefined;
a[1] = undefined;
console.log("# array two undefined:", a, a.length);
ok(a.length == 3);
a[2] = undefined;
console.log("# array three undefined:", a, a.length);
ok(a.length == 3);

ok([0, 1, 2, 3].reduce(function(a, b) {
    return a + b;
}) == 6, 'array reduce');

ok(arreq([[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
    return a.concat(b);
}), [0, 1, 2, 3, 4, 5]), 'array reduce with init');

// Array::reverse
var arr = [1, 2, 3];
arr.reverse();
ok(arreq(arr, [3, 2, 1]), 'array reverses in place');
ok(arreq(arr.reverse(), [1, 2, 3]), 'array reverses');
ok(arreq([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF].reverse(), [0xFF, 0x3f, 0x80, 0x00, 0x00, 0xFF]), 'array reverses')