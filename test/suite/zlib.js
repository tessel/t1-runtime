console.log('1..1');

var zlib = require('zlib');
var Stream = require('stream')

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

function zlibUnzipTest(data, type){
  var stream = new Stream();
  var unzip = zlib.createUnzip();

  unzip.on('data', function(buf){
    console.log('#', JSON.stringify(buf.toString()));
    console.log('#', 'zlib test', type);
    console.log(buf.toString() == input ? 'ok' : 'not ok');
  });

  unzip.on('error', function(err){
    stream.emit('error', err);
  });
  
  // pipe to unzip
  stream.pipe(unzip);
  stream.emit('data', data)
  stream.emit('end');
}

// test unzip with gzip
zlib.gzip(input, function(err, zip){
  zlibUnzipTest(zip, "gzip");
});

// test unzip with deflate
zlib.deflate(input, function(err, zip){
  zlibUnzipTest(zip, "deflate");
})
