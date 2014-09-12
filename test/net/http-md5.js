// TLS module
if (!require('crypto')._tls) {
  var tap = require('../tap');
  tap.count(1);
  tap.ok(false, 'crypto not enabled #SKIP');
  process.exit(0);
}

var tap = require('../tap');

tap.count(2);

var http = require('http');
var crypto = require('crypto');

http.get("http://httpstat.us/200", function (res) {
  tap.eq(typeof res.statusCode, 'number');
  console.log('# statusCode', res.statusCode)

  var hash = crypto.createHash('md5');
  res.pipe(hash);

  hash.on('readable', function () {
  	var md5 = hash.read().toString('hex');
  	console.log('#', md5);
  	tap.eq(md5, '3c3f2943d4337318cf737f45d5b564cd');
  })
}).on('error', function (e) {
  tap.ok(false, String(e));
});
