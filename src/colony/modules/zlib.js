var tm = process.binding('tm');
var Duplex = require('stream').Duplex;

function createGzip () {
  var stream = new Duplex();
  var _ = tm.deflate_start_gzip(1)
    , status = _[3]

  if (status != 0) {
    throw new Error('zlib error ' + status);
  }

  stream.deflate = _[0];
  stream.out = _[1];
  stream.out_total = _[2];

  stream._read = function () {
    // noop
  }
  stream._write = function (input, encoding, callback) {
    var input_total = 0;
    while (input_total < input.length) {
      var _ = tm.deflate_write(this.deflate, this.out, this.out_total, input, 0)
        , status = _[4];

      if (status != 0) {
        throw new Error('zlib error ' + status);
      }

      this.out_total = _[1]
      input_total = _[3]
    }
    callback();
  }

  stream.end = function () {
    Duplex.prototype.end.call(this);

    var _ = tm.deflate_end_gzip(this.deflate, this.out, this.out_total)
      , status = _[2];

    if (status != 0) {
      throw new Error('zlib error ' + status);
    }

    this.out_total = _[1];
    this.push(this.out.slice(0, this.out_total));
    this.push(null);
  }

  return stream;
}

function gzip (buffer, callback)
{
  var stream = createGzip(), bufs = [];
  stream.on('data', function (buf) {
    bufs.push(buf);
  })
  stream.on('error', function (err) {
    callback(err);
  })
  stream.on('end', function () {
    var gzip = Buffer.concat(bufs);
    callback(null, gzip);
  })

  stream.write(buffer);
  stream.end();
}

exports.gzip = gzip;
exports.createGzip = createGzip;
