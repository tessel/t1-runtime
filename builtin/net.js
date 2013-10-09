var util = require('util');
var Stream = require('stream').Stream;

/**
 * TCPSocket
 */

function TCPSocket (socket) {
  this.socket = socket;
}

util.inherits(TCPSocket, Stream);

TCPSocket.prototype.connect = function (port, ip, cb) {
  var ips = ip.split('.');
  var client = this;
  setImmediate(function () {
    tm_tcp_connect(client.socket, Number(ips[0]), Number(ips[1]), Number(ips[2]), Number(ips[3]), Number(port));
    client.__listen();
    cb();
  });
};

TCPSocket.prototype.__listen = function () {
  var client = this;
  setInterval(function () {
    while (tm_tcp_readable(client.socket) > 0) {
      var buf = tm_tcp_read(client.socket);
      if (!buf || buf.length == 0) {
        break;
      }
      client.emit('data', buf);
    }
  }, 100);
};

TCPSocket.prototype.write = function (buf, cb) {
  var socket = this.socket;
  setImmediate(function () {
    tm_tcp_write(socket, buf, buf.length);
    if (cb) {
      cb();
    }
  })
};

TCPSocket.prototype.close = function () {
  this.socket = tm_tcp_close(this.socket);
  this.emit('close');
};

exports.connect = function (port, host, callback) {
  var client = new TCPSocket(tm_tcp_open());
  client.connect(port, host, callback);
  return client;
};


/**
 * Server
 */

function TCPServer (socket) {
  TCPSocket.call(this, socket);
}

util.inherits(TCPServer, TCPSocket);

TCPServer.prototype.listen = function (port, ip) {
  var self = this;
  tm_tcp_listen(this.socket, port);
  setInterval(function () {
    var client;
    // why is "this" null here?
    if (tm_tcp_readable(self.socket) > 0 && (client = tm_tcp_accept(self.socket)) >= 0) {
      var clientsocket = new TCPSocket(client);
      clientsocket.__listen();
      self.emit('socket', clientsocket);
    }
  });
};

exports.createServer = function (onsocket) {
  var server = new TCPServer(tm_tcp_open());
  onsocket && server.on('socket', onsocket);
  return server; 
};