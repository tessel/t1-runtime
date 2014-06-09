/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + String(a) + ' == ' + String(b)); }

tap(1);

var obj = {};
console.log("# obj.__proto__ =", obj.__proto__);
console.log("# Object.getPrototypeOf(obj) =", Object.getPrototypeOf(obj));
eq(obj.__proto__, Object.getPrototypeOf(obj), 'same prototype');