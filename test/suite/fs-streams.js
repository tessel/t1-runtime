var fs = require('fs');

var Writable = require('stream').Writable;
var Readable = require('stream').Readable;

var output = __dirname + '/files_fs/output.txt';

console.log('1..2');

function inputTest (next) {
  var ins = new Readable;
  ins.chunks = ['HELLO', 'WORLD'];
  ins._read = function (value) {
    this.push(ins.chunks.shift());
  }

  ins.pipe(fs.createWriteStream(output))
    .on('end', function () {
      var txt = fs.readFileSync(output, 'utf-8');
      console.log('# writestream', txt);
      console.log(txt == 'HELLOWORLD' ? 'ok' : 'not ok');

      next();
    })
}

function writeTest (next) {
  var outs = new Writable();
  outs.buffers = [];
  outs._write = function (chunk, encoding, callback) {
    this.buffers.push(chunk);
    callback();
  }
  outs.on('pipe', function (pipe) {
    var self = this;
    pipe.on('end', function () {
      self.emit('buffer', Buffer.concat(self.buffers));
    })
  });

  fs.createReadStream(output)
    .pipe(outs).on('buffer', function (buf) {
      console.log('# readstream', buf.toString())
      console.log(buf.toString() == 'HELLOWORLD' ? 'ok' : 'not ok');

      next();
    });
}

inputTest(writeTest.bind(this, function () {
  try {
    fs.unlinkSync(output)
  } catch (e) { }
  console.log('# done');
}))