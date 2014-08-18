var tap = require('../tap');

tap.count(11);

tap.ok((new Buffer([-1]))[0] == 0xff, 'wrap: -1 == 0xff');
tap.ok((new Buffer([0x555 % 0xFF]))[0] == 0x5a, 'wrap: 0x555 % 0xFF == 0x5a');

tap.ok((new Buffer([256]))[0] == 0x00, 'wrap: 256 == 0');
tap.ok((new Buffer([-256]))[0] == 0x00, 'wrap: -256 == 0');
tap.ok((new Buffer([0x555]))[0] == 0x55, 'wrap: 0x555 == 0x55');
tap.ok((new Buffer([300]))[0] == 0x2c, 'wrap: 300 == 0x2c');
tap.ok((new Buffer([-300]))[0] == 0xd4, 'wrap: -300 == 0xd4');
tap.ok((new Buffer([-0x555]))[0] == 0xab, 'wrap: -0x555 == 0xab');

var a = 0x555, b = 0xFF
tap.ok((-a) % b == -90, 'modulus check: -0x555 % 0xFF == -90');
tap.ok((new Buffer([(-0x555) % 0xff]))[0] == 0xa6, 'wrap: -0x555 % 0xff == 0xa6');

var b = new Buffer(1);
b.writeInt8(-1, 0);
tap.ok(b[0] == 0xff, 'writing -1 yields 0');