/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(3);

var dict = {};
dict['1'] = 1;
dict['01'] = 2;
dict['0x10'] = 3;
dict['a'] = 4;
// console.log(dict, Object.keys(dict), dict['1'], dict['0x10'], dict['16']);

ok(dict['1'] == 1)
ok(Object.keys(dict).map(String).indexOf('01') > 0)
ok(Object.keys(dict).map(String).indexOf('0x10') > 0)
