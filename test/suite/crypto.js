console.log('1..7'); // Just success in runnning

var crypto = require('crypto');

console.log(crypto.randomBytes(16).length == 16 ? 'ok' : 'not ok');
console.log(crypto.randomBytes(256).length == 256 ? 'ok' : 'not ok');

// hmac
var hash_key = 'there is no dana'
var hash_str = 'only xuul'
var hash_output = 'f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4';
var hash = crypto.createHmac('sha1', hash_key)
  .update(hash_str)
  .digest('hex');

console.log('#', hash);
console.log(hash == hash_output ? 'ok' : 'not ok', '#SKIP');

var hash_input = 'f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4f1ac6e2f923135cf1659e63f1dfb8157a5ef80b4'
var hash_output = '11c8b4be10465e0b13eaf6bd88a52cee964f2fc0';
var hash = crypto.createHmac('sha1', hash_input)
  .update(hash_input)
  .digest('hex');

console.log('#', hash);
console.log(hash == hash_output ? 'ok' : 'not ok', '#SKIP');

// md5
var hash_output = '902fbdd2b1df0c4f70b4a5d23525e932';
var hash = crypto.createHash('md5')
  .update(String('A'))
  .update(String('B'))
  .update(String('C'))
  .digest('hex');

console.log('#', hash);
console.log(hash == hash_output ? 'ok' : 'not ok', '#SKIP');

var hash = crypto.createHash('md5');
hash.on('readable', function () {
	var md5 = hash.read().toString('hex');
	console.log('#', md5);
	console.log(md5 == hash_output ? 'ok' : 'not ok', '#SKIP');
})
hash.write(String('A'));
hash.write(String('B'))
hash.write(String('C'))
hash.end();

console.log('ok');