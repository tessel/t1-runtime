var tap = require('../tap');

tap.count(7);

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
	tap.eq(internal(), 'internal')
	tap.eq(external(), 'external');
	obj.external = function () {
		return 'internal';
	}
	tap.eq(external(), 'internal');
	a = 6;
}
tap.eq(a, 6);

t = 5;
var a, x, y;
var r = 10;

with (Math) {
  a = PI * r * r;
  x = r * cos(PI);
  y = r * sin(PI / 2);
}

tap.eq(a, Math.PI * 100)
tap.eq(x, -10)
tap.eq(y, 10)
