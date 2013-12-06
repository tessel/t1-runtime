var tm = process.binding('tm');

var EventEmitter = require('events').EventEmitter;

function UDP (socket) {
  this.socket = socket;
}

UDP.prototype = new EventEmitter();

UDP.prototype.bind = function (port) {
  tm.udp_listen(this.socket, port);
  var client = this;
  setInterval(function () {
    var r = tm.udp_readable(client.socket);
    while (r) {
      var buf = tm.udp_receive(client.socket);
      client.emit('message', buf);
    }
  }, 100);
  cb && cb();
}

UDP.prototype.send = function (text, offset, len, port, ip) {
  var ips = ip.split('.');
  if (typeof text != 'string') {
    text = text.toString('utf8')
  }
  tm.udp_send(this.socket, ips[0], ips[1], ips[2], ips[3], port, text.substr(offset, len));
}

UDP.prototype.close = function () {
  this.socket = tm.udp_close(this.socket);
}

exports.createSocket = function () {
  return new UDP(tm.udp_open());
};
