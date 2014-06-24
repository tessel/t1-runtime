console.log('1..1');

var zlib = require('zlib');

var input = 'HELLO WORLD\n';

zlib.gzip(input, function (err, zip) {
  zlib.gunzip(zip, function (err, str) {
    console.log('#', JSON.stringify(str.toString()));
    console.log('#', JSON.stringify(input));
    console.log(str.toString() == input ? 'ok' : 'not ok');
  })
})

zlib.deflate(input, function (err, zip) {
  zlib.inflate(zip, function (err, str) {
    console.log('#', JSON.stringify(str.toString()));
    console.log('#', JSON.stringify(input));
    console.log(str.toString() == input ? 'ok' : 'not ok');
  })
})

zlib.deflateRaw(input, function (err, zip) {
  zlib.inflateRaw(zip, function (err, str) {
    console.log('#', JSON.stringify(str.toString()));
    console.log('#', JSON.stringify(input));
    console.log(str.toString() == input ? 'ok' : 'not ok');
  })
})
