var tm = process.binding('tm');

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
    tm.tcp_connect(client.socket, Number(ips[0]), Number(ips[1]), Number(ips[2]), Number(ips[3]), Number(port));
    client.__listen();
    cb();
  });
};

TCPSocket.prototype.__listen = function () {
  var client = this;
  this.__listenid = setInterval(function () {
    while (client.socket && tm.tcp_readable(client.socket) > 0) {
      var buf = tm.tcp_read(client.socket);
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
    tm.tcp_write(socket, buf, buf.length);
    if (cb) {
      cb();
    }
  })
};

TCPSocket.prototype.close = function () {
  var self = this;
  if (this.__listenid) {
    clearInterval(this.__listenid);
    this.__listenid = null
  }
  setImmediate(function () {
    tm.tcp_close(self.socket);
    self.socket = null;
    self.emit('close');
  });
};

exports.connect = function (port, host, callback) {
  var sock = tm.tcp_open();
  if (sock == -1) {
    throw 'ENOENT: Cannot connect to new socket.'
  }
  
  var client = new TCPSocket(sock);
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
  var res = tm.tcp_listen(this.socket, port);
  if (res < 0) {
    throw "Error listening on TCP socket (port " + port + ", ip " + ip + ")"
  }

  setInterval(function () {
    var client;
    if (tm.tcp_readable(self.socket) > 0 && (client = tm.tcp_accept(self.socket)) >= 0) {
      var clientsocket = new TCPSocket(client);
      clientsocket.__listen();
      self.emit('socket', clientsocket);
    }
  });
};

exports.createServer = function (onsocket) {
  var server = new TCPServer(tm.tcp_open());
  onsocket && server.on('socket', onsocket);
  return server; 
};
