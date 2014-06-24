var tm = process.binding('tm');
var Duplex = require('stream').Duplex;

function createDeflateStream (type) {
  var stream = new Duplex();
  var _ = tm.deflate_start(type, 1)
    , status = _[3]

  if (status != 0) {
    throw new Error('zlib start error ' + status);
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
      var _ = tm.deflate_write(this.deflate, this.out, this.out_total, input, input_total)
        , status = _[4];

      if (status != 0) {
        throw new Error('zlib write error ' + status);
      }

      this.out_total = _[1]
      input_total = _[3]
    }
    callback();
  }

  stream.end = function () {
    Duplex.prototype.end.call(this);

    var _ = tm.deflate_end(this.deflate, this.out, this.out_total)
      , status = _[2];

    if (status != 0) {
      throw new Error('zlib end error ' + status);
    }

    this.out_total = _[1];
    this.push(this.out.slice(0, this.out_total));
    this.push(null);
  }

  return stream;
}

function createInflateStream (type) {
  var stream = new Duplex();
  var _ = tm.inflate_start(type)
    , status = _[3]

  if (status != 0) {
    throw new Error('zlib start error ' + status);
  }

  stream.inflate = _[0];
  stream.out = _[1];
  stream.out_total = _[2];

  stream._read = function () {
    // noop
  }
  stream._write = function (input, encoding, callback) {
    var input_total = 0;
    while (input_total < input.length) {
      var _ = tm.inflate_write(this.inflate, this.out, this.out_total, input, input_total)
        , status = _[4];

      if (status != 0) {
        throw new Error('zlib write error ' + status);
      }

      this.out_total = _[1]
      input_total = _[3]
    }
    callback();
  }

  stream.end = function () {
    Duplex.prototype.end.call(this);

    var _ = tm.inflate_end(this.inflate, this.out, this.out_total)
      , status = _[2];

    if (status != 0) {
      throw new Error('zlib end error ' + status);
    }

    this.out_total = _[1];
    this.push(this.out.slice(0, this.out_total));
    this.push(null);
  }

  return stream;
}

function convenience (stream, buffer, callback)
{
  var bufs = [];
  stream.on('data', function (buf) {
    bufs.push(buf);
  })
  stream.on('error', function (err) {
    callback(err);
  })
  stream.on('end', function () {
    var done = Buffer.concat(bufs);
    callback(null, done);
  })

  stream.write(buffer);
  stream.end();
}


function createGzip ()
{
  return createDeflateStream(tm.GZIP);
}

function createGunzip ()
{
  return createInflateStream(tm.GZIP);
}

function createDeflate ()
{
  return createDeflateStream(tm.ZLIB);
}

function createInflate ()
{
  return createInflateStream(tm.ZLIB);
}

function createDeflateRaw ()
{
  return createDeflateStream(tm.RAW);
}

function createInflateRaw ()
{
  return createInflateStream(tm.RAW);
}


function gzip (buffer, callback)
{
  return convenience(createGzip(), buffer, callback);
}

function gunzip (buffer, callback)
{
  return convenience(createGunzip(), buffer, callback);
}

function deflate (buffer, callback)
{
  return convenience(createDeflate(), buffer, callback);
}

function inflate (buffer, callback)
{
  return convenience(createInflate(), buffer, callback);
}

function deflateRaw (buffer, callback)
{
  return convenience(createDeflateRaw(), buffer, callback);
}

function inflateRaw (buffer, callback)
{
  return convenience(createInflateRaw(), buffer, callback);
}


exports.createGzip = createGzip;
exports.createGunzip = createGunzip;
exports.createDeflate = createDelate;
exports.createInflate = createInflate;
exports.createDeflateRaw = createDelateRaw;
exports.createInflateRaw = createInflateRaw;

exports.gzip = gzip;
exports.gunzip = gunzip;
exports.deflate = deflate;
exports.inflate = inflate;
exports.deflateRaw = deflateRaw;
exports.inflateRaw = inflateRaw;
