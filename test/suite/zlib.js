console.log('1..1');

var zlib = require('zlib');
var Stream = require('stream');
var crypto = require('crypto');

var inputs = [
  'HELLO WORLD\n',
  '{!@#$%^&*()}_+-=\n\r\t',
  "012345678",
  '{"created": true}',
  '0',
  crypto.randomBytes(4096)
  ];

function zlibUnzipTest(data, type, input){
  var stream = new Stream();
  var unzip = zlib.createUnzip();

  unzip.on('data', function(buf){
    console.log('#', input.toString());
    console.log('#', 'zlib test', type, 'got', buf.toString());
    console.log(buf.toString() == input.toString() ? 'ok' : 'not ok');
  });

  unzip.on('error', function(err){
    stream.emit('error', err);
  });
  
  // pipe to unzip
  stream.pipe(unzip);
  stream.emit('data', data)
  stream.emit('end');
}

inputs.forEach(function(input){
  zlib.gzip(input, function (err, zip) {
    zlib.gunzip(zip, function (err, str) {
      console.log('#', JSON.stringify(str.toString()));
      console.log('#', JSON.stringify(input));
      console.log(str.toString() == input.toString() ? 'ok' : 'not ok');
    })
  })

  zlib.deflate(input, function (err, zip) {
    zlib.inflate(zip, function (err, str) {
      console.log('#', JSON.stringify(str.toString()));
      console.log('#', JSON.stringify(input));
      console.log(str.toString() == input.toString() ? 'ok' : 'not ok');
    })
  })

  zlib.deflateRaw(input, function (err, zip) {
    zlib.inflateRaw(zip, function (err, str) {
      console.log('#', JSON.stringify(str.toString()));
      console.log('#', JSON.stringify(input));
      console.log(str.toString() == input.toString() ? 'ok' : 'not ok');
    })
  })

  // test unzip with gzip
  zlib.gzip(input, function(err, zip){
    zlibUnzipTest(zip, "gzip", input);
  });

  // test unzip with deflate
  zlib.deflate(input, function(err, zip){
    zlibUnzipTest(zip, "deflate", input);
  })

});
