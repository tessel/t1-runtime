var tap = require('../tap');

tap.count(1);

var net = require('net');
net.createServer(function (sock) {
  var server = this;
  sock.on('data', function (d) {
    tap.eq(d.length, 3);
    server.close();
    sock.end();     // (only needed under colony)
  });
}).listen(0, function () {
  net.createConnection({port:this.address().port}, function () {
      this.end(Buffer([0x00, 0xFF, 0x00]));
  });
});