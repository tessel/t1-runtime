function UDP (socket) {
  this.socket = socket;
}

UDP.prototype = new EventEmitter();

UDP.prototype.bind = function (port) {
  tm.net_udp_listen(this.socket, port);
  var client = this;
  setInterval(function () {
    var r = tm.net_is_readable(client.socket);
    while (r) {
      var buf = tm.net_udp_receive(client.socket);
      client.emit('data', buf);
    }
  }, 100);
  cb && cb();
}

UDP.prototype.send = function (ip, port, text) {
  var ips = ip.split('.');
  tm.net_udp_send(this.socket, ips[0], ips[1], ips[2], ips[3], port, text);
}

UDP.prototype.close = function () {
  this.socket = tm.net_udp_close_socket(this.socket);
}

require.cache['!dgram'] = {
  createSocket: function () {
    return new UDP(tm.net_udp_open_socket());
  }
};
