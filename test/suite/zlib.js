console.log('1..1');

var zlib = require('zlib');
zlib.gzip('HELLO WORLD\n', function (err, gzip) {
  console.log(gzip.length == 35 ? 'ok' : 'not ok');
})
