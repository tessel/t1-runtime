var EventEmitter = require('events').EventEmitter;

function TCPSocket (socket) {
  this.socket = socket;
}

TCPSocket.prototype = new EventEmitter();

TCPSocket.prototype.connect = function (port, ip, cb) {
  var ips = ip.split('.');
  var client = this;
  setImmediate(function () {
    tm_tcp_connect(client.socket, Number(ips[0]), Number(ips[1]), Number(ips[2]), Number(ips[3]), Number(port));
    setInterval(function () {
      while (tm_tcp_readable(client.socket) > 0) {
        var buf = tm_tcp_read(client.socket);
        if (buf.length == 0) {
          break;
        }
        client.emit('data', buf);
      }
    }, 100);
    cb();
  });
}

TCPSocket.prototype.write = function (buf, cb) {
  var socket = this.socket;
  setImmediate(function () {
    tm_tcp_write(socket, buf, buf.length);
    if (cb) {
      cb();
    }
  })
}

TCPSocket.prototype.close = function () {
  this.socket = tm_tcp_close(this.socket);
  this.emit('close');
}

exports.connect = function (port, host, callback) {
  var client = new TCPSocket(tm_tcp_open());
  client.connect(port, host, callback);
  return client;
};