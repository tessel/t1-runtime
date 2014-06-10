/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + String(a) + ' == ' + String(b)); }

tap(27);

eq(0 ^ 10, 10, 'xor operator');
eq('' ^ 10, 10, 'xor operator');
eq(null ^ 10, 10, 'xor operator');

eq(4 & 5, 4, 'and operator');
eq(65535 & 0xFF, 0xFF, 'and operator');
eq(0xff & 0, 0, 'and operator');
eq(null & 5, 0, 'and operator');
eq(null & '', 0, 'and operator');

eq(1 | 0xFE, 0xFF, 'or operator');
eq(null | 1, 1, 'or operator');
eq('' | 1, 1, 'or operator');

eq(~0x7f, -128, 'not operator #SKIP');
eq(~0xFF, -256, 'not operator #SKIP');
eq(~0, -1, 'not operator #SKIP');
eq(~(-0x80), 127, 'not operator #SKIP');
eq(~0xFF & 0x80, 0, 'not operator');

ok((1 << 0) == 1, "1 << 0");
ok((1 << 8) == 256, "1 << 8");
ok((1 << 40) == 256, "1 << 256");
ok((256 >>> 8) == 1, "256 >>> 8");
ok((-256 >>> 8) == 16777215, "-256 >>> 8");
ok((256 >> 8) == 1, "256 >> 8");
ok((-256 >> 8) == -1, "-256 >> 8");
ok((0x87654321 << 12) == 0x54321000, "0x87654321 << 12")
ok((0x87654321 >>> 12) == 0x00087654, "0x87654321 >>> 12")
ok(((0x87654321 >> 12) >>> 0) == 0xfff87654, "0x87654321 >> 12")
console.log('#', ((0x87654321 >> 12) >>> 0));

ok((-256 >>> 0) == 0xffffff00, "-256 >>> 0");
console.log('#', (-256 >>> 0), '==', 0xffffff00);
