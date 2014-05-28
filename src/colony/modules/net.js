// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Portions Copyright Joyent, Inc. and other Node contributors.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.


var tm = process.binding('tm');

var util = require('util');
var dns = require('dns');
var Stream = require('stream');

/**
 * ssl
 */

var ssl_ctx = null;

function ensureSSLCtx () {
  if (!tm.ssl_context_create) {
    throw new Error("SSL/TLS is not supported in this version.");
  }
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
  this._outgoing = [];
  this._sending = false;
}

util.inherits(TCPSocket, Stream);

function isIP (host) {
  return host.match(/^[0-9.]+$/);
}

function isPipeName(s) {
  return util.isString(s) && toNumber(s) === false;
}

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

function normalizeConnectArgs(args) {
  var options = {};

  if (util.isObject(args[0])) {
    // connect(options, [cb])
    options = args[0];
  } else if (isPipeName(args[0])) {
    // connect(path, [cb]);
    options.path = args[0];
  } else {
    // connect(port, [host], [cb])
    options.port = args[0];
    if (util.isString(args[1])) {
      options.host = args[1];
    }
  }

  var cb = args[args.length - 1];
  return util.isFunction(cb) ? [options, cb] : [options];
}

TCPSocket.prototype.connect = function (/*options | [port], [host], [cb]*/) {
  var self = this;
  var args = normalizeConnectArgs(arguments);
  var port = args[0].port;
  var host = args[0].host;
  var cb = args[1];

  if (cb) {
    self.once('connect', cb);
  }

  setImmediate(function () {
    if (isIP(host)) {
      doConnect(host);
    } else {
      dns.resolve(host, function onResolve(err, ips) {
        if (err) {
          return self.emit('error', err);
        }
        doConnect(ips[0]);
      })
    }

    function doConnect(ip) {
      ip = ip.split('.').map(Number);
      tm.tcp_connect(self.socket, ip[0], ip[1], ip[2], ip[3], Number(port));

      if (self._secure) {
        var ssl = tm.ssl_session_create(ssl_ctx, self.socket);
        self._ssl = ssl;
      }

      self.__listen();
      self.emit('connect');
    }
  });
};

TCPSocket.prototype.__listen = function () {
  var self = this;
  this.__listenid = setInterval(function () {
    if (self._sending) {
      return;
    }

    var buf = '', flag = 0;
    while (self.socket != null && (flag = tm.tcp_readable(self.socket)) > 0) {
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

    // Check error condition.
    if (flag < 0) {
      console.log('NOT READABLE');
      self.emit('error', new Error('Socket closed.'));
      self.destroy();
      return;
    }

    if (buf.length) {
      self.emit('data', buf);
    }
  }, 10);
};

// Maximum packet size CC can handle.
var WRITE_PACKET_SIZE = 1024;

TCPSocket.prototype.write = function (buf, cb) {
  var self = this;

  if (!Buffer.isBuffer(buf)) {
    buf = new Buffer(buf);
  }
  if (buf.length > WRITE_PACKET_SIZE) {
    for (var i = 0; i < buf.length; i += WRITE_PACKET_SIZE) {
      var s = buf.slice(i, i + WRITE_PACKET_SIZE);
      this._outgoing.push(s);
    }
  } else {
    this._outgoing.push(buf);
  }

  this.__send();
};

TCPSocket.prototype.__send = function () {
  if (this._sending || !this._outgoing.length) {
    return false;
  }
  this._sending = true;

  var self = this;
  var buf = this._outgoing.shift();
  (function send () {
    if (self._ssl) {
      var ret = tm.ssl_write(self._ssl, buf, buf.length);
    } else {
      var ret = tm.tcp_write(self.socket, buf, buf.length);
    }

    if (ret == -11) {
      // EWOULDBLOCK / EAGAIN
      setImmediate(send);
    } else if (ret < 0) {
      // Error.
      throw new Error(-ret);
    } else {
      // Next buffer.
      self._sending = false;
      self.__send();
    }
  })();
}

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
    var _ = tm.tcp_accept(self.socket)
      , client = _[0]
      , err = _[1];

    if (!err && client >= 0) {
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
