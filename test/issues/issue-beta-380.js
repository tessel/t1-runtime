var tap = require('../tap');

tap.count(2);

var b = Buffer(20),
    s = b.fill(0xFF) || b.slice(5,15);
b.fill(0);
tap.eq(s.toString('hex'), '00000000000000000000');
s.fill(42);
tap.eq(b.toString('hex'), '00000000002a2a2a2a2a2a2a2a2a2a0000000000');
