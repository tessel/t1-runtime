/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

function arreq (a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (var i = 0; i < a.length; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

var a = new Buffer([5, 6, 7, 8]);
ok(a.length == 4, 'buffer.length');
ok(a[3] == 8, 'buffer indexing');
ok(a[4] == null, 'buffer high indexing');

a = new Buffer('hello');
ok(a.length == 5, 'buffer char length');
ok(a[0] == 104, 'buffer char index');

a = new Buffer(100);
ok(a.length == 100, 'buffer fixed size len')

a = new Buffer(100);
a.fill(0xfe);
var success = true;
for (var i = 0; i < a.length; i++) {
	if (a[i] != 0xfe) {
		success = false
	}
}
ok(success, 'buffer.fill worked')

ok(Buffer.isBuffer(new Buffer('hello')), 'Buffer.isBuffer succeeds on buffer')
ok(!Buffer.isBuffer([]), 'Buffer.isBuffer fails on non-buffer (array)')
ok(!Buffer.isBuffer(''), 'Buffer.isBuffer fails on non-buffer (string)')
ok(!Buffer.isBuffer(null), 'Buffer.isBuffer fails on non-buffer (null)')

a = new Buffer(5);
a.fill(0xFF)
b = new Buffer(10);
b.fill(0x00)
a.copy(b, 3, 0, 3)
for (var i = 0, sum = 0; i < b.length; i++) {
	sum += b[i]
}
ok(sum == 765, 'buffer.copy works')

a = new Buffer([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
b = a.slice(3, 6)
for (var i = 0, sum = 0; i < b.length; i++) {
	sum += b[i]
}
ok(b.length == 3, 'buffer.slice length')
ok(sum == 12, 'buffer.slice works')

var e = null;
try {
	b.copy([1, 2, 3, 4], 3, 0, 3)
} catch (_e) { e = _e }
ok(!!e, 'error on buffer copy to non-buffer target')

a = new Buffer([0x03, 0xab, 0x23, 0x42])
for (var i = 0, arr = []; i < a.length + 1; i++) {
	arr.push(a.readUInt8(i, true))
}
console.log('#', arr);
ok(arreq(arr, [0x03, 0xab, 0x23, 0x42, undefined]), 'readUInt8 and assert work')

ok(a.readUInt8(0) == 0x3, 'readUInt8')
ok(a.readUInt16LE(0) == 43779, 'readUInt16LE')
ok(a.readUInt16BE(0) == 939, 'readUInt16BE')
ok(a.readUInt32LE(0) == 1109633795, 'readUInt32LE')
ok(a.readUInt32BE(0) == 61547330, 'readUInt32BE')
ok(a.readInt8(0) == 3, 'readInt8')
ok(a.readInt16LE(0) == -21757, 'readInt16LE')
ok(a.readInt16BE(0) == 939, 'readInt16BE')
ok(a.readInt32LE(0) == 1109633795, 'readInt32LE')
ok(a.readInt32BE(0) == 61547330, 'readInt32BE')

var f = new Buffer([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF]);
ok(f.readFloatLE(1) == 1, 'readFloatLE');
console.log('#', f.readFloatLE(1));
var f = new Buffer([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF].reverse());
ok(f.readFloatBE(1) == 1, 'readFloatBE');
console.log('#', f.readFloatBE(1));
var f = new Buffer([0xFF, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0xd5, 0x3f, 0xFF]);
ok(f.readDoubleLE(1) == 1/3, 'readDoubleLE');
var f = new Buffer([0xFF, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0xd5, 0x3f, 0xFF].reverse());
ok(f.readDoubleBE(1) == 1/3, 'readDoubleBE');

ok(a.readUInt16BE(1) == 43811, 'buffer read offsets')

var a = new Buffer([0, 0, 0, 0]);
a.writeUInt8(0xde, 0); ok(a[0] == 0xde, 'writeUInt8');
a.writeUInt16LE(43779, 0); ok(a.readUInt16LE(0) == 43779, 'writeUInt16LE');
a.writeUInt16BE(939, 0); ok(a.readUInt16BE(0) == 939, 'writeUInt16BE');
a.writeUInt32LE(1109633795, 0); ok(a.readUInt32LE(0) == 1109633795, 'writeUInt32LE');
a.writeUInt32BE(61547330, 0); ok(a.readUInt32BE(0) == 61547330, 'writeUInt32BE');
a.writeInt8(-25, 0); ok(a.readInt8(0) == -25, 'writeInt8');
a.writeInt16LE(-21757, 0); ok(a.readInt16LE(0) == -21757, 'writeInt16LE');
a.writeInt16BE(939, 0); ok(a.readInt16BE(0) == 939, 'writeInt16BE');
a.writeInt32LE(1109633795, 0); ok(a.readInt32LE(0) == 1109633795, 'writeInt32LE');
a.writeInt32BE(61547330, 0); ok(a.readInt32BE(0) == 61547330, 'writeInt32BE');

var f = new Buffer(10);
f.fill(0);
f.writeFloatLE(1, 1); ok(f.readFloatLE(1) == 1, 'writeFloatLE');
console.log('#', f, f.readFloatLE(1));
f.writeFloatBE(1, 1); ok(f.readFloatBE(1) == 1, 'writeFloatBE');
console.log('#', f, f.readFloatBE(1));
f.writeDoubleLE(1/3, 1); ok(f.readDoubleLE(1) == 1/3, 'writeDoubleLE');
f.writeDoubleBE(1/3, 1); ok(f.readDoubleBE(1) == 1/3, 'writeDoubleBE');

a.fill(0)
a.writeInt16LE(-21757, 1);
ok(a.readUInt8(2) == 171, 'buffer write offsets')

var a = new Buffer([1, 2, 3]), b = new Buffer([4, 5, 6]), c = new Buffer([7, 8, 9, 10, 11]);
var abc = Buffer.concat([a, b, c]);
ok(abc.length == a.length + b.length + c.length, 'buffer concat length');
ok(arreq(abc, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), 'buffer concat works');
ok(arreq(abc.toJSON(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), 'buffer toJSON works');

var b = Buffer([255,255,255,255]);
ok(b.readUInt8(0) == 0xFF, 'readUInt8(0xff)');
ok(b.readInt8(0) == -1, 'readInt8(0xff)');
ok(b.readUInt16LE(0) == 0xFFFF, 'readUInt32LE(0xffff)');
ok(b.readUInt16BE(0) == 0xFFFF, 'readUInt32BE(0xffff)');
ok(b.readUInt32LE(0) == 0xFFFFFFFF, 'readUInt32LE(0xffffffff)');
ok(b.readUInt32BE(0) == 0xFFFFFFFF, 'readUInt32BE(0xffffffff)');


// encodings
console.log('\n# hex')
var b = new Buffer('deadbeefcafebabe', 'hex');
ok(b.readUInt32BE(0) == 0xdeadbeef, 'hex encoding');
ok(b.readUInt32BE(4) == 0xcafebabe, 'hex encoding');
console.log('#', '0x' + b.readUInt32BE(0).toString(16), '0x' + b.readUInt32BE(4).toString(16))
try { new Buffer('gggg', 'hex'); ok(false); } catch (e) { ok(true, 'invalid hex digits'); }
try { new Buffer('0', 'hex'); ok(false); } catch (e) { ok(true, 'invalid hex length'); }

console.log('\n# base64')
var b = new Buffer('aGVsbG8gd29ybGQ=', 'base64');
ok(b.toString() == 'hello world', 'base64 encoding (padded)');
var b = new Buffer('aGVsbG8gd29ybGQ', 'base64');
ok(b.toString() == 'hello world', 'base64 encoding (not padded)');
console.log('#', JSON.stringify(b.toString()));

console.log('\n# encoding')
ok(new Buffer(new Buffer('hello world').toString('base64'), 'base64').toString() == 'hello world', 'str -> base64 -> str')
console.log('#', new Buffer('hello world').toString('base64'))
console.log('#', new Buffer(new Buffer('hello world').toString('base64'), 'base64'))
ok(new Buffer(new Buffer('hello world').toString('hex'), 'hex').toString() == 'hello world', 'str -> hex -> str')
console.log('#', new Buffer('hello world').toString('hex'))
console.log('#', new Buffer(new Buffer('hello world').toString('hex'), 'hex'))