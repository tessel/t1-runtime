var tap = require('../tap');

tap.count(2);

tap.ok(2^16 == 16, 'bitwise xor')
tap.ok(2^16 != 65536, 'not exponent')
