/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(1);

var b = Buffer([1,2,3]).slice(3,50);
console.log('#', b);
ok(b.length == 0, 'buffer.slice does not read past end.');
