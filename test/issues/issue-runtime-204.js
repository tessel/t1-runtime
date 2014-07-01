/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + JSON.stringify(String(a)) + ' == ' + JSON.stringify(String(b))); }

tap(3);

eq(String([1]), '1', 'stringed-array doesn\'t leave trailing comma');

eq("12345678".match(/\d/g).length, [1,2,3,4,5,6,7,8].length, 'match split length');
eq(String("12345678".match(/\d/g)), '1,2,3,4,5,6,7,8', 'match split entries');
