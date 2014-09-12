var tap = require('../tap');

tap.count(2);

var a = new Date();
tap.eq(a - a, 0);

var a = new Date();
var a_val = Number(a);
var b = {
	valueOf: function () {
		return a_val - 1000;
	}
}
tap.eq(a - b, 1000);
