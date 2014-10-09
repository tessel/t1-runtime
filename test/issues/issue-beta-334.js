var tap = require('../tap');

tap.count(11);

var buf = new Buffer(4);

buf.writeUInt32BE(0xdeadbeef, 0);
tap.ok(buf[0] == 0xde, 'UInt32');
tap.ok(buf[1] == 0xad, 'UInt32');
tap.ok(buf[2] == 0xbe, 'UInt32');
tap.ok(buf[3] == 0xef, 'UInt32');
buf.fill(0);

try {
	buf.writeUInt32LE(0xdeadbeef, 2);
	tap.ok(false, 'error not thrown by out of bounds write')
} catch (e) {
	tap.ok(true, 'error thrown by out of bounds write')
}

try {
	buf.writeUInt32LE(0xdeadbeef, 2, true);
	tap.ok(true, 'error not thrown by out of bounds write')
} catch (e) {
	tap.ok(false, 'error thrown by out of bounds write')
}
tap.ok(buf[2] == 0xef, 'out of bounds write still writes');
tap.ok(buf[3] == 0xbe, 'out of bounds write still writes');

try {
	buf.readUInt32LE(2);
	tap.ok(false, 'error not thrown by out of bounds read')
} catch (e) {
	tap.ok(true, 'error thrown by out of bounds write')
}

buf[0] = 0;
buf[1] = 0;
buf[2] = 0xFF;
buf[3] = 0xFF;
var value = buf.readUInt32LE(0, true);
tap.ok(value == 4294901760, 'in bounds write succeeds')
var value = buf.readUInt32LE(2, true);
tap.ok(isNaN(value) || (value == 65535), 'out of bounds write returns 65535 (older) or NaN (newer) depending on Node version')