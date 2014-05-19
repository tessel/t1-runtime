console.log('1..6');

var arg = "Hello Friends";
var ret = Buffer.concat( [ arg ] );
console.log(arg === ret ? 'ok' : 'not ok');

try { 
	Buffer.concat( [ arg, arg ] );
	console.log('not ok');
} catch (e) {
	console.log('ok');
}

var a = new Buffer(16);
var b = new Buffer(16);
a.copy(b, 256, 0, 0);
console.log('ok');

var rando = new Buffer(16);
Buffer.concat([rando, rando], 32);
Buffer.concat([rando, rando], 31);
Buffer.concat([rando, rando], 128);
console.log('ok')
try {
	Buffer.concat([rando, rando], 8)
	console.log('not ok');
} catch (e) {
	console.log('ok');
}

try {
	Buffer.concat()
} catch (e) {
	console.log('ok -', String(e));
}
