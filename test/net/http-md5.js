// TLS module
if (!require('crypto')._tls) {
  console.log('1..1');
  console.log('not ok - crypto not enabled #SKIP');
  process.exit(0);
}

console.log('1..2')

var http = require('http');
var crypto = require('crypto');

http.get("http://httpstat.us/200", function (res) {
  console.log('ok')
  console.log('# statusCode', res.statusCode)

  var hash = crypto.createHash('md5');
  res.pipe(hash);

  hash.on('readable', function () {
  	var md5 = hash.read().toString('hex');
  	console.log('#', md5);
  	console.log(md5 == '3c3f2943d4337318cf737f45d5b564cd' ? 'ok' : 'not ok');
  })
}).on('error', function (e) {
  console.log('not ok -', e.message, 'error event')
});
