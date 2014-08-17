var tap = require('../tap');

tap.count(6);

var arg = "Hello Friends";
var ret = Buffer.concat( [ arg ] );
tap.eq(arg, ret);

try { 
	Buffer.concat( [ arg, arg ] );
	tap.ok(false);
} catch (e) {
	tap.ok(e);
}

var a = new Buffer(16);
var b = new Buffer(16);
a.copy(b, 256, 0, 0);
tap.ok(true);

var rando = new Buffer(16);
Buffer.concat([rando, rando], 32);
Buffer.concat([rando, rando], 31);
Buffer.concat([rando, rando], 128);
tap.ok(true);
try {
	Buffer.concat([rando, rando], 8)
	tap.ok(false);
} catch (e) {
	tap.ok(e);
}

try {
	Buffer.concat()
} catch (e) {
	tap.ok(e);
}
