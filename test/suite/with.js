/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var internal = function () {
	return 'external';
}

var external = function () {
	return 'external';
}

var obj = {
	internal: function () {
		return 'internal';
	}
}

var a = 5;
with (obj) {
	console.log(internal() == 'internal' ? 'ok 1' : 'not ok 1');
	console.log(external() == 'external' ? 'ok 2' : 'not ok 2');
	obj.external = function () {
		return 'internal';
	}
	console.log(external() == 'internal' ? 'ok 3' : 'not ok 3');
	a = 6;
}
console.log(a == 6 ? 'ok 4' : 'not ok 4');

t = 5;
var a, x, y;
var r = 10;

with (Math) {
  a = PI * r * r;
  x = r * cos(PI);
  y = r * sin(PI / 2);
}

ok(a == Math.PI * 100)
ok(x == -10)
ok(y == 10)