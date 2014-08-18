var tap = require('../tap');

tap.count(9);

_typeof = function () { tap.ok(false, 'typeof overwritten'); }
typeof 5;

var dlow = 6;
dlow = 5;
tap.ok(dlow != 6, 'simple variable scoping');

var d_high;
d__high = 6;
(function () {
	var d_high;
	d__high = 5;
})();
tap.ok(d__high == 5, 'var decl underscores are escaped properly');

var a_b = 'hi';
tap.ok(a_b == 'hi', 'var underscores');

a_b += ' there';
tap.ok(a_b == 'hi there', 'var underscores in lvalue of assignment');

tap.ok(a_b.toUpperCase() == 'HI THERE', 'underscore in lvalue of member expression');

var c_d = {};
c_d.cool_beans = 5;
tap.ok(c_d['cool_beans'] == 5, 'dynamic property values')

c_d.func_tastic = function () {
  tap.ok(true, 'underscore in member and base')
}
c_d.func__tastic = function () {
	tap.ok(false,' underscore in member and base');
}
c_d.func_tastic();

var actions = ["a", "b", "c", "d", "e", "f", "g"];
var _n = 1;
tap.ok(actions[_n] != undefined, 'underscores in member properties not undefined');
var _j = {_k: 5}
tap.ok(actions[_j._k] != undefined, 'underscores in member properties in member properties not undefined');