/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(2);

ok(2^16 == 16, 'bitwise xor')
ok(2^16 != 65536, 'not exponent')