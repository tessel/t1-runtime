/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(1);

var b = Buffer([1,2,3,4,5,6]).slice(1,-2);
console.log('#', b);
ok(b.length == 3, 'buffer.slice accepts negative indices');