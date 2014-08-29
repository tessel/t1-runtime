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

// auto-detect header.
function Unzip(opts) {
  if (!(this instanceof Unzip)) return new Unzip(opts);
  Zlib.call(this, opts, binding.UNZIP);
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

function createUnzip ()
{
  return new Unzip();
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

// the Zlib class they all inherit from
// This thing manages the queue of requests, and returns
// true or false if there is anything in the queue when
// you call the .write() method.

function Zlib(opts, mode) {
  this._opts = opts = opts || {};
  this._chunkSize = opts.chunkSize || exports.Z_DEFAULT_CHUNK;

  Transform.call(this, opts);

  if (opts.flush) {
    if (opts.flush !== binding.Z_NO_FLUSH &&
        opts.flush !== binding.Z_PARTIAL_FLUSH &&
        opts.flush !== binding.Z_SYNC_FLUSH &&
        opts.flush !== binding.Z_FULL_FLUSH &&
        opts.flush !== binding.Z_FINISH &&
        opts.flush !== binding.Z_BLOCK) {
      throw new Error('Invalid flush flag: ' + opts.flush);
    }
  }
  this._flushFlag = opts.flush || binding.Z_NO_FLUSH;

  if (opts.chunkSize) {
    if (opts.chunkSize < exports.Z_MIN_CHUNK ||
        opts.chunkSize > exports.Z_MAX_CHUNK) {
      throw new Error('Invalid chunk size: ' + opts.chunkSize);
    }
  }

  if (opts.windowBits) {
    if (opts.windowBits < exports.Z_MIN_WINDOWBITS ||
        opts.windowBits > exports.Z_MAX_WINDOWBITS) {
      throw new Error('Invalid windowBits: ' + opts.windowBits);
    }
  }

  if (opts.level) {
    if (opts.level < exports.Z_MIN_LEVEL ||
        opts.level > exports.Z_MAX_LEVEL) {
      throw new Error('Invalid compression level: ' + opts.level);
    }
  }

  if (opts.memLevel) {
    if (opts.memLevel < exports.Z_MIN_MEMLEVEL ||
        opts.memLevel > exports.Z_MAX_MEMLEVEL) {
      throw new Error('Invalid memLevel: ' + opts.memLevel);
    }
  }

  if (opts.strategy) {
    if (opts.strategy != exports.Z_FILTERED &&
        opts.strategy != exports.Z_HUFFMAN_ONLY &&
        opts.strategy != exports.Z_RLE &&
        opts.strategy != exports.Z_FIXED &&
        opts.strategy != exports.Z_DEFAULT_STRATEGY) {
      throw new Error('Invalid strategy: ' + opts.strategy);
    }
  }

  if (opts.dictionary) {
    if (!util.isBuffer(opts.dictionary)) {
      throw new Error('Invalid dictionary: it should be a Buffer instance');
    }
  }

  this._handle = new binding.Zlib(mode);

  var self = this;
  this._hadError = false;
  this._handle.onerror = function(message, errno) {
    // there is no way to cleanly recover.
    // continuing only obscures problems.
    self._handle = null;
    self._hadError = true;

    var error = new Error(message);
    error.errno = errno;
    error.code = exports.codes[errno];
    self.emit('error', error);
  };

  var level = exports.Z_DEFAULT_COMPRESSION;
  if (util.isNumber(opts.level)) level = opts.level;

  var strategy = exports.Z_DEFAULT_STRATEGY;
  if (util.isNumber(opts.strategy)) strategy = opts.strategy;

  this._handle.init(opts.windowBits || exports.Z_DEFAULT_WINDOWBITS,
                    level,
                    opts.memLevel || exports.Z_DEFAULT_MEMLEVEL,
                    strategy,
                    opts.dictionary);

  this._buffer = new Buffer(this._chunkSize);
  this._offset = 0;
  this._closed = false;
  this._level = level;
  this._strategy = strategy;

  this.once('end', this.close);
}

util.inherits(Zlib, Transform);

Zlib.prototype.params = function(level, strategy, callback) {
  if (level < exports.Z_MIN_LEVEL ||
      level > exports.Z_MAX_LEVEL) {
    throw new RangeError('Invalid compression level: ' + level);
  }
  if (strategy != exports.Z_FILTERED &&
      strategy != exports.Z_HUFFMAN_ONLY &&
      strategy != exports.Z_RLE &&
      strategy != exports.Z_FIXED &&
      strategy != exports.Z_DEFAULT_STRATEGY) {
    throw new TypeError('Invalid strategy: ' + strategy);
  }

  if (this._level !== level || this._strategy !== strategy) {
    var self = this;
    this.flush(binding.Z_SYNC_FLUSH, function() {
      assert(!self._closed, 'zlib binding closed');
      self._handle.params(level, strategy);
      if (!self._hadError) {
        self._level = level;
        self._strategy = strategy;
        if (callback) callback();
      }
    });
  } else {
    process.nextTick(callback);
  }
};

Zlib.prototype.reset = function() {
  assert(!this._closed, 'zlib binding closed');
  return this._handle.reset();
};

// This is the _flush function called by the transform class,
// internally, when the last chunk has been written.
Zlib.prototype._flush = function(callback) {
  this._transform(new Buffer(0), '', callback);
};

Zlib.prototype.flush = function(kind, callback) {
  var ws = this._writableState;

  if (util.isFunction(kind) || (util.isUndefined(kind) && !callback)) {
    callback = kind;
    kind = binding.Z_FULL_FLUSH;
  }

  if (ws.ended) {
    if (callback)
      process.nextTick(callback);
  } else if (ws.ending) {
    if (callback)
      this.once('end', callback);
  } else if (ws.needDrain) {
    var self = this;
    this.once('drain', function() {
      self.flush(callback);
    });
  } else {
    this._flushFlag = kind;
    this.write(new Buffer(0), '', callback);
  }
};

Zlib.prototype.close = function(callback) {
  if (callback)
    process.nextTick(callback);

  if (this._closed)
    return;

  this._closed = true;

  this._handle.close();

  var self = this;
  process.nextTick(function() {
    self.emit('close');
  });
};

Zlib.prototype._transform = function(chunk, encoding, cb) {
  var flushFlag;
  var ws = this._writableState;
  var ending = ws.ending || ws.ended;
  var last = ending && (!chunk || ws.length === chunk.length);

  if (!util.isNull(chunk) && !util.isBuffer(chunk))
    return cb(new Error('invalid input'));

  if (this._closed)
    return cb(new Error('zlib binding closed'));

  // If it's the last chunk, or a final flush, we use the Z_FINISH flush flag.
  // If it's explicitly flushing at some other time, then we use
  // Z_FULL_FLUSH. Otherwise, use Z_NO_FLUSH for maximum compression
  // goodness.
  if (last)
    flushFlag = binding.Z_FINISH;
  else {
    flushFlag = this._flushFlag;
    // once we've flushed the last of the queue, stop flushing and
    // go back to the normal behavior.
    if (chunk.length >= ws.length) {
      this._flushFlag = this._opts.flush || binding.Z_NO_FLUSH;
    }
  }

  this._processChunk(chunk, flushFlag, cb);
};

Zlib.prototype._processChunk = function(chunk, flushFlag, cb) {
  var availInBefore = chunk && chunk.length;
  var availOutBefore = this._chunkSize - this._offset;
  var inOff = 0;

  var self = this;

  var async = util.isFunction(cb);

  if (!async) {
    var buffers = [];
    var nread = 0;

    var error;
    this.on('error', function(er) {
      error = er;
    });

    assert(!this._closed, 'zlib binding closed');
    do {
      var res = this._handle.writeSync(flushFlag,
                                       chunk, // in
                                       inOff, // in_off
                                       availInBefore, // in_len
                                       this._buffer, // out
                                       this._offset, //out_off
                                       availOutBefore); // out_len
    } while (!this._hadError && callback(res[0], res[1]));

    if (this._hadError) {
      throw error;
    }

    var buf = Buffer.concat(buffers, nread);
    this.close();

    return buf;
  }

  assert(!this._closed, 'zlib binding closed');
  var req = this._handle.write(flushFlag,
                               chunk, // in
                               inOff, // in_off
                               availInBefore, // in_len
                               this._buffer, // out
                               this._offset, //out_off
                               availOutBefore); // out_len

  req.buffer = chunk;
  req.callback = callback;

  function callback(availInAfter, availOutAfter) {
    if (self._hadError)
      return;

    var have = availOutBefore - availOutAfter;
    assert(have >= 0, 'have should not go down');

    if (have > 0) {
      var out = self._buffer.slice(self._offset, self._offset + have);
      self._offset += have;
      // serve some output to the consumer.
      if (async) {
        self.push(out);
      } else {
        buffers.push(out);
        nread += out.length;
      }
    }

    // exhausted the output buffer, or used all the input create a new one.
    if (availOutAfter === 0 || self._offset >= self._chunkSize) {
      availOutBefore = self._chunkSize;
      self._offset = 0;
      self._buffer = new Buffer(self._chunkSize);
    }

    if (availOutAfter === 0) {
      // Not actually done.  Need to reprocess.
      // Also, update the availInBefore to the availInAfter value,
      // so that if we have to hit it a third (fourth, etc.) time,
      // it'll have the correct byte counts.
      inOff += (availInBefore - availInAfter);
      availInBefore = availInAfter;

      if (!async)
        return true;

      var newReq = self._handle.write(flushFlag,
                                      chunk,
                                      inOff,
                                      availInBefore,
                                      self._buffer,
                                      self._offset,
                                      self._chunkSize);
      newReq.callback = callback; // this same function
      newReq.buffer = chunk;
      return;
    }

    if (!async)
      return false;

    // finished with the chunk.
    cb();
  }
};



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
exports.createUnzip = createUnzip;
