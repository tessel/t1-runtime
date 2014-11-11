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

http.get("http://tessel-httpbin.herokuapp.com/status/418", function (res) {
  tap.eq(typeof res.statusCode, 'number', 'statuscode is a number');
  console.log('# statusCode', res.statusCode)

  var hash = crypto.createHash('md5');
  res.pipe(hash);

  hash.on('readable', function () {
  	var md5 = hash.read().toString('hex');
  	console.log('#', md5);
  	tap.eq(md5, 'a039239a1eae504e41cb810c98419b99', 'teapot md5 works');
  })
}).on('error', function (e) {
  tap.ok(false, String(e));
});
