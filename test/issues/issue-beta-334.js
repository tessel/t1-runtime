/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(11);

var buf = new Buffer(4);

buf.writeUInt32BE(0xdeadbeef, 0);
ok(buf[0] == 0xde, 'UInt32');
ok(buf[1] == 0xad, 'UInt32');
ok(buf[2] == 0xbe, 'UInt32');
ok(buf[3] == 0xef, 'UInt32');
buf.fill(0);

try {
	buf.writeUInt32LE(0xdeadbeef, 2);
	ok(false, 'error not thrown by out of bounds write')
} catch (e) {
	ok(true, 'error thrown by out of bounds write')
}

try {
	buf.writeUInt32LE(0xdeadbeef, 2, true);
	ok(true, 'error not thrown by out of bounds write')
} catch (e) {
	ok(false, 'error thrown by out of bounds write')
}
ok(buf[2] == 0xef, 'out of bounds write still writes');
ok(buf[3] == 0xbe, 'out of bounds write still writes');

try {
	buf.readUInt32LE(2);
	ok(false, 'error not thrown by out of bounds read')
} catch (e) {
	ok(true, 'error thrown by out of bounds write')
}

buf[0] = 0;
buf[1] = 0;
buf[2] = 0xFF;
buf[3] = 0xFF;
var value = buf.readUInt32LE(0, true);
ok(value == 4294901760, 'in bounds write succeeds')
try {
	var value = buf.readUInt32LE(2, true);
	ok(value == 65535, 'out of bounds write succeeds')
} catch (e) {
	console.log('not ok')
}
