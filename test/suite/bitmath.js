var tap = require('../tap');

tap.count(27);

tap.eq(0 ^ 10, 10, 'xor operator');
tap.eq('' ^ 10, 10, 'xor operator');
tap.eq(null ^ 10, 10, 'xor operator');

tap.eq(4 & 5, 4, 'and operator');
tap.eq(65535 & 0xFF, 0xFF, 'and operator');
tap.eq(0xff & 0, 0, 'and operator');
tap.eq(null & 5, 0, 'and operator');
tap.eq(null & '', 0, 'and operator');

tap.eq(1 | 0xFE, 0xFF, 'or operator');
tap.eq(null | 1, 1, 'or operator');
tap.eq('' | 1, 1, 'or operator');

tap.eq(~0x7f, -128, 'not operator #SKIP');
tap.eq(~0xFF, -256, 'not operator #SKIP');
tap.eq(~0, -1, 'not operator #SKIP');
tap.eq(~(-0x80), 127, 'not operator #SKIP');
tap.eq(~0xFF & 0x80, 0, 'not operator');

tap.ok((1 << 0) == 1, "1 << 0");
tap.ok((1 << 8) == 256, "1 << 8");
tap.ok((1 << 40) == 256, "1 << 256");
tap.ok((256 >>> 8) == 1, "256 >>> 8");
tap.ok((-256 >>> 8) == 16777215, "-256 >>> 8");
tap.ok((256 >> 8) == 1, "256 >> 8");
tap.ok((-256 >> 8) == -1, "-256 >> 8");
tap.ok((0x87654321 << 12) == 0x54321000, "0x87654321 << 12")
tap.ok((0x87654321 >>> 12) == 0x00087654, "0x87654321 >>> 12")
tap.ok(((0x87654321 >> 12) >>> 0) == 0xfff87654, "0x87654321 >> 12")
console.log('#', ((0x87654321 >> 12) >>> 0));

tap.ok((-256 >>> 0) == 0xffffff00, "-256 >>> 0");
console.log('#', (-256 >>> 0), '==', 0xffffff00);
