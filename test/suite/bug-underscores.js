/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')


var dlow = 6;
dlow = 5;
ok(dlow != 6, 'simple variable scoping');

var d_high;
d__high = 6;
(function () {
	var d_high;
	d__high = 5;
})();
ok(d__high == 5, 'var decl underscores are escaped properly');

var a_b = 'hi';
ok(a_b == 'hi', 'var underscores');

a_b += ' there';
ok(a_b == 'hi there', 'var underscores in lvalue of assignment');

ok(a_b.toUpperCase() == 'HI THERE', 'underscore in lvalue of member expression');

var c_d = {};
c_d.cool_beans = 5;
ok(c_d['cool_beans'] == 5, 'dynamic property values')

c_d.func_tastic = function () {
  ok(true, 'underscore in member and base')
}
c_d.func__tastic = function () {
	ok(false,' underscore in member and base');
}
c_d.func_tastic();

var actions = ["a", "b", "c", "d", "e", "f", "g"];
var _n = 1;
ok(actions[_n] != undefined, 'underscores in member properties not undefined');
var _j = {_k: 5}
ok(actions[_j._k] != undefined, 'underscores in member properties in member properties not undefined');