var tap = require('../tap');

tap.count(96);

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
tap.ok(a.length == 4, 'buffer.length');
tap.ok(a[3] == 8, 'buffer indexing');
tap.ok(a[4] == null, 'buffer high indexing');

a = new Buffer('hello');
tap.ok(a.length == 5, 'buffer char length');
tap.ok(a[0] == 104, 'buffer char index');

a = new Buffer(100);
tap.ok(a.length == 100, 'buffer fixed size len')

a = new Buffer(100);
a.fill(0xfe);
var success = true;
for (var i = 0; i < a.length; i++) {
	if (a[i] != 0xfe) {
		success = false
	}
}
tap.ok(success, 'buffer.fill worked')

tap.ok(Buffer.isBuffer(new Buffer('hello')), 'Buffer.isBuffer succeeds on buffer')
tap.ok(!Buffer.isBuffer([]), 'Buffer.isBuffer fails on non-buffer (array)')
tap.ok(!Buffer.isBuffer(''), 'Buffer.isBuffer fails on non-buffer (string)')
tap.ok(!Buffer.isBuffer(null), 'Buffer.isBuffer fails on non-buffer (null)')

a = new Buffer(5);
a.fill(0xFF)
b = new Buffer(10);
b.fill(0x00)
a.copy(b, 3, 0, 3)
for (var i = 0, sum = 0; i < b.length; i++) {
	sum += b[i]
}
tap.ok(sum == 765, 'buffer.copy works')

a = new Buffer([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
b = a.slice(3, 6)
for (var i = 0, sum = 0; i < b.length; i++) {
	sum += b[i]
}
tap.ok(b.length == 3, 'buffer.slice length')
tap.ok(sum == 12, 'buffer.slice works')

var e = null;
try {
	b.copy([1, 2, 3, 4], 3, 0, 3)
} catch (_e) { e = _e }
tap.ok(!!e, 'error on buffer copy to non-buffer target')

a = new Buffer([0x03, 0xab, 0x23, 0x42])
for (var i = 0, arr = []; i < a.length + 1; i++) {
	arr.push(a.readUInt8(i, true))
}
console.log('#', arr);
tap.ok(arreq(arr, [0x03, 0xab, 0x23, 0x42, undefined]), 'readUInt8 and assert work')

tap.ok(a.readUInt8(0) == 0x3, 'readUInt8')
tap.ok(a.readUInt16LE(0) == 43779, 'readUInt16LE')
tap.ok(a.readUInt16BE(0) == 939, 'readUInt16BE')
tap.ok(a.readUInt32LE(0) == 1109633795, 'readUInt32LE')
tap.ok(a.readUInt32BE(0) == 61547330, 'readUInt32BE')
tap.ok(a.readInt8(0) == 3, 'readInt8')
tap.ok(a.readInt16LE(0) == -21757, 'readInt16LE')
tap.ok(a.readInt16BE(0) == 939, 'readInt16BE')
tap.ok(a.readInt32LE(0) == 1109633795, 'readInt32LE')
tap.ok(a.readInt32BE(0) == 61547330, 'readInt32BE')

var f = new Buffer([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF]);
tap.ok(f.readFloatLE(1) == 1, 'readFloatLE');
console.log('#', f.readFloatLE(1));
var f = new Buffer([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF].reverse());
tap.ok(f.readFloatBE(1) == 1, 'readFloatBE');
console.log('#', f.readFloatBE(1));
var f = new Buffer([0xFF, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0xd5, 0x3f, 0xFF]);
tap.ok(f.readDoubleLE(1) == 1/3, 'readDoubleLE');
var f = new Buffer([0xFF, 0x55, 0x55, 0x55, 0x55, 0x55, 0x55, 0xd5, 0x3f, 0xFF].reverse());
tap.ok(f.readDoubleBE(1) == 1/3, 'readDoubleBE');

tap.ok(a.readUInt16BE(1) == 43811, 'buffer read offsets')

var a = new Buffer([0, 0, 0, 0]);
a.writeUInt8(0xde, 0); tap.ok(a[0] == 0xde, 'writeUInt8');
a.writeUInt16LE(43779, 0); tap.ok(a.readUInt16LE(0) == 43779, 'writeUInt16LE');
a.writeUInt16BE(939, 0); tap.ok(a.readUInt16BE(0) == 939, 'writeUInt16BE');
a.writeUInt32LE(1109633795, 0); tap.ok(a.readUInt32LE(0) == 1109633795, 'writeUInt32LE');
a.writeUInt32BE(61547330, 0); tap.ok(a.readUInt32BE(0) == 61547330, 'writeUInt32BE');
a.writeInt8(-25, 0); tap.ok(a.readInt8(0) == -25, 'writeInt8');
a.writeInt16LE(-21757, 0); tap.ok(a.readInt16LE(0) == -21757, 'writeInt16LE');
a.writeInt16BE(939, 0); tap.ok(a.readInt16BE(0) == 939, 'writeInt16BE');
a.writeInt32LE(1109633795, 0); tap.ok(a.readInt32LE(0) == 1109633795, 'writeInt32LE');
a.writeInt32BE(61547330, 0); tap.ok(a.readInt32BE(0) == 61547330, 'writeInt32BE');

var f = new Buffer(10);
f.fill(0);
f.writeFloatLE(1, 1); tap.ok(f.readFloatLE(1) == 1, 'writeFloatLE');
console.log('#', f, f.readFloatLE(1));
f.writeFloatBE(1, 1); tap.ok(f.readFloatBE(1) == 1, 'writeFloatBE');
console.log('#', f, f.readFloatBE(1));
f.writeDoubleLE(1/3, 1); tap.ok(f.readDoubleLE(1) == 1/3, 'writeDoubleLE');
f.writeDoubleBE(1/3, 1); tap.ok(f.readDoubleBE(1) == 1/3, 'writeDoubleBE');

a.fill(0)
a.writeInt16LE(-21757, 1);
tap.ok(a.readUInt8(2) == 171, 'buffer write offsets')

var a = new Buffer([1, 2, 3]), b = new Buffer([4, 5, 6]), c = new Buffer([7, 8, 9, 10, 11]);
var abc = Buffer.concat([a, b, c]);
tap.ok(abc.length == a.length + b.length + c.length, 'buffer concat length');
tap.ok(arreq(abc, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), 'buffer concat works');
tap.ok(arreq(abc.toJSON(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]), 'buffer toJSON works');

var b = Buffer([255,255,255,255]);
tap.ok(b.readUInt8(0) == 0xFF, 'readUInt8(0xff)');
tap.ok(b.readInt8(0) == -1, 'readInt8(0xff)');
tap.ok(b.readUInt16LE(0) == 0xFFFF, 'readUInt32LE(0xffff)');
tap.ok(b.readUInt16BE(0) == 0xFFFF, 'readUInt32BE(0xffff)');
tap.ok(b.readUInt32LE(0) == 0xFFFFFFFF, 'readUInt32LE(0xffffffff)');
tap.ok(b.readUInt32BE(0) == 0xFFFFFFFF, 'readUInt32BE(0xffffffff)');


// encodings
console.log('\n# hex')
var b = new Buffer('deadbeefcafebabe', 'hex');
tap.ok(b.readUInt32BE(0) == 0xdeadbeef, 'hex encoding');
tap.ok(b.readUInt32BE(4) == 0xcafebabe, 'hex encoding');
console.log('#', '0x' + b.readUInt32BE(0).toString(16), '0x' + b.readUInt32BE(4).toString(16))

var b = new Buffer('AA__55', 'hex');
tap.eq(b.length, 1, 'invalid hex digits truncated');
tap.eq(b[0], 0xAA, 'invalid hex digits truncate but return a value');
try { new Buffer('0', 'hex'); tap.ok(false); } catch (e) { tap.ok(true, 'invalid hex length'); }

console.log('\n# base64')
var b = new Buffer('aGVsbG8gd29ybGQ=', 'base64');
tap.ok(b.toString() == 'hello world', 'base64 encoding (padded)');
var b = new Buffer('aGVsbG8gd29ybGQ', 'base64');
tap.ok(b.toString() == 'hello world', 'base64 encoding (not padded)');
console.log('#', JSON.stringify(b.toString()));

console.log('\n# encoding')
tap.ok(new Buffer(new Buffer('hello world').toString('base64'), 'base64').toString() == 'hello world', 'str -> base64 -> str')
console.log('#', new Buffer('hello world').toString('base64'))
console.log('#', new Buffer(new Buffer('hello world').toString('base64'), 'base64'))
tap.ok(new Buffer(new Buffer('hello world').toString('hex'), 'hex').toString() == 'hello world', 'str -> hex -> str')
console.log('#', new Buffer('hello world').toString('hex'))
console.log('#', new Buffer(new Buffer('hello world').toString('hex'), 'hex'))

var b = new Buffer([0, 0x41, 0x82, 0x104]);
tap.eq(b.length, 4, "array ingested");
tap.eq(b[0], 0x00);
tap.eq(b[1], 0x41);
tap.eq(b[2], 0x82);
tap.eq(b[3], 0x04);
tap.eq(b.toString('binary'), "\u0000\u0041\u0082\u0004", "binary toString");
tap.eq(b.toString('binary').length, 4);
tap.eq(b.toString('ascii'), "\u0000\u0041\u0002\u0004", "ascii toString");
tap.eq(b.toString('ascii').length, 4);
tap.eq(b.toString('utf8'), "\u0000\u0041\uFFFD\u0004", "utf8 toString");
tap.eq(b.toString('utf8').length, 4);
tap.eq(b.toString('utf16le'), "\u4100\u0482", "utf16le toString");
tap.eq(b.toString('utf16le').length, 2);
tap.eq(b.toString('ucs2').length, 2);
tap.eq(b.toString('base64'), "AEGCBA==", "base64 toString");
tap.eq(b.toString('base64').length, 8);
tap.eq(b.toString('hex'), "00418204", "hex toString");
tap.eq(b.toString('base64').length, 8);

tap.eq(Buffer("\u8182", 'utf8')[2], 0x82, "buffer from utf8");
tap.eq(Buffer("\u8182", 'utf8').length, 3);
tap.eq(Buffer("\u8182", 'ascii')[0], 0x82, "buffer from ascii");
tap.eq(Buffer("\u8182", 'ascii').length, 1);
tap.eq(Buffer("\u8182", 'binary')[0], 0x82, "buffer from binary");
tap.eq(Buffer("\u8182", 'binary').length, 1);
tap.eq(Buffer("\u8182", 'utf16le')[1], 0x81, "buffer from utf16le");
tap.eq(Buffer("\u8182", 'utf16le').length, 2);
tap.eq(Buffer("\u8182", 'ucs2')[1], 0x81);
tap.eq(Buffer("\u8182", 'base64').length, 0, "buffer from [bad] base64");
var threw;
try {
  Buffer("\u8182", 'hex');
} catch (e) {
  threw = e;
}
tap.ok(threw, "buffer from [bad] hex");


// write
var buf = new Buffer(256);
var len = buf.write('\u00bd + \u00bc = \u00be', 4);
console.log('#', len + " bytes: " + buf.toString('utf8', 4, 4 + len));
tap.ok(len == 12, 'written length is 12 byes')
tap.ok(buf.slice(4, 4 + 12).toString() == '\u00bd + \u00bc = \u00be', 'result was written')

// inspecting
tap.ok(require('buffer').INSPECT_MAX_BYTES === 50, 'default INSPECT_MAX_BYTES is 50')
