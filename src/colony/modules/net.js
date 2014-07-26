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
var tls = require('tls');

/**
 * ssl
 */

var ssl_ctx = null;

function ensureSSLCtx () {
  console.log('you hit ensureSSLCtx');
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
  console.log('you hit TCPSocket');
  Stream.Duplex.call(this);
  this.socket = socket;
  this._secure = _secure;
  this._outgoing = [];
  this._sending = false;

  var self = this;
  self._closehandler = function (buf) {
    var socket = buf.readUInt32LE(0);
    console.log('this is TCPSockets socket',socket);
    if (socket == self.socket) {
      setImmediate(function () {
        console.log('socket is self.socket');
        // console.log('closing', socket, 'against', self.socket)
        self.close();
      });
    }
  }
  process.on('tcp-close', this._closehandler)
}

util.inherits(TCPSocket, Stream.Duplex);

function isIP (host) {
  console.log('you hit isIP');
  return host.match(/^[0-9.]+$/);
}

function isPipeName(s) {
  console.log('you hit isPipeName');
  return util.isString(s) && toNumber(s) === false;
}

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

function normalizeConnectArgs(args) {
  console.log('you hit normalizeConnectArgs');
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
  console.log('you hit TCPSocket connect');
  var self = this;
  var args = normalizeConnectArgs(arguments);
  var port = args[0].port;
  var host = args[0].host;
  var cb = args[1];

  self._port = port;
  self._address = host;

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
      var ret = tm.tcp_connect(self.socket, ip[0], ip[1], ip[2], ip[3], Number(port));
      if (ret < 0) {
        throw new Error('ENOENT Cannot connect to ' + ip.join('.'));
      }

      if (self._secure) {
        var hostname = null;
        if (!isIP(host)) {
          hostname = host;
        }
        var _ = tm.ssl_session_create(ssl_ctx, self.socket, hostname)
          , ssl = _[0]
          , ret = _[1]
        if (ret != 0) {
          if (ret == -517) {
            throw new Error('CERT_HAS_EXPIRED');
          } else if (ret == -516) {
            throw new Error('CERT_NOT_YET_VALID');
          } else {
            throw new Error('Could not validate SSL request (error ' + ret + ')');
          }
        }

        var cert = {
          subjectaltname: (function () {
            var altnames = [];
            for (var i = 0; ; i++) {
              var _ = tm.ssl_session_altname(ssl, i)
                , altname = _[0]
                , ret = _[1]
              if (ret != 0) {
                break;
              }
              altnames.push(altname);
            }
            return 'DNS:' + altnames.join(', DNS:');
          })(),
          subject: {
            CN: tm.ssl_session_cn(ssl)[0]
          }
        }

        if (!tls.checkServerIdentity(host, cert)) {
          throw new Error('Hostname/IP doesn\'t match certificate\'s altnames');
        }

        self._ssl = ssl;
      }

      self.__listen();
      self.emit('connect');
    }
  });
};

TCPSocket.prototype._read = function (size) {
  // TODO: start polling it again
}

TCPSocket.prototype.__listen = function () {
  console.log('you hit TCPSocket __listen');
  var self = this;
  this.__listenid = setTimeout(function loop () {
    self.__listenid = null;

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
      // console.log('DESTROY');
      // self.emit('error', new Error('Socket closed.'));
      self.destroy();
      return;
    }

    if (buf.length) {
      self.push(buf);
      // TODO: stop polling if this returns false
    }

    self.__listenid = setTimeout(loop, 10);
  }, 10);
};

TCPSocket.prototype.address = function () {
  console.log('you hit TCPSocket address');
  return {
    port: this._port,
    family: 'IPv4',
    address: this._address
  };
};

// Maximum packet size CC can handle.
var WRITE_PACKET_SIZE = 1024;

TCPSocket.prototype._write = function (buf, encoding, cb) {
  var self = this;
  console.log('Your buffer 1:', buf.toString());
  // buf = new Buffer('GET /switch/socket/?EIO=3&t=1405639587082.8-2&b64=1&transport=pollingHTTP/1.1');
  // console.log('your buffer 2:', buf.toString());
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
  cb(); // TODO: only once it actually sends
};

TCPSocket.prototype.__send = function () {
  console.log('you hit TCPSocket __send');
  if (this._sending || !this._outgoing.length) {
    return false;
  }
  this._sending = true;

  var self = this;

  var buf = this._outgoing.shift();
  console.log('buffer in TCP Socket __send', buf.toString());
  (function send () {
    if (self._ssl) {
      var ret = tm.ssl_write(self._ssl, buf, buf.length);
    } else {
      console.log('hello');
      var ret = tm.tcp_write(self.socket, buf, buf.length);
    }
    console.log('ret:', ret);
    if (ret == -11) {
      // EWOULDBLOCK / EAGAIN
      setImmediate(send);
    } else if (ret < 0) {
      // Error.
      throw new Error(-ret);
    } else {
      console.log('whop')
      // Next buffer.
      self._sending = false;
      self.__send();
    }
  })();
}

TCPSocket.prototype.destroy = TCPSocket.prototype.close = function () {
  var self = this;
  setImmediate(function () {
    if (self.__listenid != null) {
      clearInterval(self.__listenid);
      self.__listenid = null
    }
    if (self.socket != null) {
      process.removeListener('tcp-close', self._closehandler);
      tm.tcp_close(self.socket);
      self.socket = null;
      self.emit('close');
    }
  });
};

TCPSocket.prototype.setTimeout = function () { /* noop */ };
TCPSocket.prototype.setNoDelay = function () { /* noop */ };

function connect (port, host, callback, _secure) {
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

  self._port = port;
  self._address = ip;

  setInterval(function () {
    var _ = tm.tcp_accept(self.socket)
      , client = _[0]
      , ip = _[1];

    if (client >= 0) {
      var clientsocket = new TCPSocket(client);
      clientsocket.__listen();
      self.emit('socket', clientsocket);
    }
  }, 10);
};

function createServer (onsocket) {
  console.log('homie');
  var server = new TCPServer(tm.tcp_open());
  onsocket && server.on('socket', onsocket);
  return server;
};


/**
 * Public API
 */

exports.isIP = isIP;
exports.connect = exports.createConnection = connect;
exports.createServer = createServer;
exports.Socket = TCPSocket;
exports.Server = TCPServer;
