var tm = process.binding('tm');

var util = require('util');
var Stream = require('stream').Stream;

/**
 * ssl
 */

var ssl_ctx = null;

function ensureSSLCtx () {
  if (ssl_ctx == null) {
    ssl_ctx = tm.ssl_context_create();
  }
}


/**
 * TCPSocket
 */

function TCPSocket (socket, _secure) {
  this.socket = socket;
  this._secure = _secure;
}

util.inherits(TCPSocket, Stream);

TCPSocket.prototype.connect = function (port, ip, cb) {
  var ips = ip.split('.');
  var self = this;
  setImmediate(function () {
    tm.tcp_connect(self.socket, Number(ips[0]), Number(ips[1]), Number(ips[2]), Number(ips[3]), Number(port));
    
    if (self._secure) {
      var ssl = tm.ssl_session_create(ssl_ctx, self.socket);
      self._ssl = ssl;
    }

    self.__listen();
    cb();
    self.emit('connect');
  });
};

TCPSocket.prototype.__listen = function () {
  var self = this;
  this.__listenid = setInterval(function () {
    var buf = '';
    while (self.socket != null && tm.tcp_readable(self.socket) > 0) {
      if (self._ssl) {
        var data = tm.ssl_read(self._ssl);
      } else {
        var data = tm.tcp_read(self.socket);
      }
      if (!data || data.length == 0) {
        break;
      }
      buf += data;
    }
    if (buf.length) {
      self.emit('data', buf);
    }
  }, 0);
};

TCPSocket.prototype.write = function (buf, cb) {
  var self = this;
  setImmediate(function () {
    if (self._ssl) {
      tm.ssl_write(self._ssl, buf, buf.length);
    } else {
      tm.tcp_write(self.socket, buf, buf.length);
    }
    if (cb) {
      cb();
    }
  })
};

TCPSocket.prototype.destroy = TCPSocket.prototype.close = function () {
  var self = this;
  if (this.__listenid != null) {
    clearInterval(this.__listenid);
    this.__listenid = null
  }
  setImmediate(function () {
    tm.tcp_close(self.socket);
    self.socket = null;
    self.emit('close');
  });
};

exports.connect = function (port, host, callback, _secure) {
  if (_secure) {
    ensureSSLCtx();
  }

  var sock = tm.tcp_open();
  if (sock == -1) {
    throw 'ENOENT: Cannot connect to new socket.'
  }
  
  var client = new TCPSocket(sock, _secure);
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
    if ((client = tm.tcp_accept(self.socket)) >= 0) {
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
