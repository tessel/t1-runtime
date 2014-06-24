console.log('1..1');

var zlib = require('zlib');

var input = 'HELLO WORLD\n';

zlib.gzip(input, function (err, gzip) {
  zlib.gunzip(gzip, function (err, str) {
    console.log('#', JSON.stringify(str.toString()));
    console.log('#', JSON.stringify(input));
    console.log(str.toString() == input ? 'ok' : 'not ok');
  })
})
