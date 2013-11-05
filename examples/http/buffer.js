var b = new Buffer(256);

b[0] = 0xff;
console.log(b.toString());

b.fill(0xde, 0, 32);
console.log(b.toString());

var c = new Buffer(32);
c.fill(0)
b.copy(c, 16, 0, 32)
console.log(c.toString());


// file system test

var fs = require('fs');
console.log(fs.readFileSync('examples/http/buffer.js'));