/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')


var actions = ["a", "b", "c", "d", "e", "f", "g"];
var _n = 1;
ok(actions[_n] == 'b', 'underscores in member properties not undefined');
var _j = {_k: 5}
ok(actions[_j._k] == 'f', 'underscores in member properties in member properties not undefined');

// var actions = ["a", "b", "c", "d", "e", "f", "g"];
// for (_n in actions) {
//   console.log("_n", _n);
//   console.log("actions[_n]", actions[_n]);
// }
// for (n in actions) {
//   console.log("n", n);
//   console.log("actions[n]", actions[n]);
// }
// var _i, _len;
// for (_i = 0, _len = actions.length; _i < _len; _i++) {
//   console.log("_i", _i);
//   console.log("actions[_i]", actions[_i]);
// }
// var i, len;
// for (i = 0, len = actions.length; i < len; i++) {
//   console.log("i", i);
//   console.log("actions[i]", actions[i]);
// }