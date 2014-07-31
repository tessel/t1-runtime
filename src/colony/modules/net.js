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
 * ip/helpers
 */
function isIPv4 (host) {
  // via http://stackoverflow.com/a/5284410/179583 + modified to disallow leading 0s
  return /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.|$)){4}/.test(host);
}

function isIPv6 (host) {
  // via http://stackoverflow.com/a/17871737/179583
  var itIs = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/.test(host);
  if (!itIs && typeof host === 'string') {
    // HACK: regex above doesn't handle all IPv4-suffixed-IPv6 addresses, and, well…do you really blame me for not fixing it?
    var parts = host.split(':');
    if (isIPv4(parts[parts.length-1])) {
      parts.pop();
      parts.push('FFFF:FFFF');
      itIs = isIPv6(parts.join(':'));
    }
  }
  return itIs;
}

function isIP (host) {
  if (isIPv6(host)) return 6;
  else if (isIPv4(host)) return 4;
  else return 0;
}

function isPipeName(s) {
  return util.isString(s) && toNumber(s) === false;
}

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

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
  Stream.Duplex.call(this);
  
  if (socket === null) {
    if (_secure) ensureSSLCtx();
    this.socket = tm.tcp_open();
  } else {
    this.socket = socket;
  }
  this._secure = _secure;
  this._outgoing = [];
  this._sending = false;
  this._queueEnd = false;

  var self = this;
  if (this.socket < 0) {
    setImmediate(function () {
      self.emit('error', new Error("ENOENT: Cannot open another socket."));
    });
    return;
  }
  self.on('finish', function () {
    // this is called when writing is ended
    // TODO: support allowHalfOpen (if firmware can?)
    self.close();
  })
  self._closehandler = function (buf) {
    var socket = buf.readUInt32LE(0);
    if (socket == self.socket) {
      setImmediate(function () {
        // console.log('closing', socket, 'against', self.socket)
        self.close();
      });
    }
  }
  process.on('tcp-close', this._closehandler)
}

util.inherits(TCPSocket, Stream.Duplex);

TCPSocket._portsUsed = Object.create(null);

TCPSocket._requestPort = function (port) {
  // NOTE: only supports _automatic_ port assignment; we track (but not *check*) manually requested ports
  if (port === 0) {
    port = 1024;    // NOTE: could optimize, e.g. by starting from last-granted or assuming only 7 sockets…
    while (port in TCPSocket._portsUsed) ++port;
  }
  TCPSocket._portsUsed[port] = true;
  return port;
};

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
  var opts = args[0];
  if (opts.allowHalfOpen) console.warn("Ignoring allowHalfOpen option.");
  var port = +opts.port;
  var host = opts.host || "127.0.0.1";
  var cb = args[1];

  self._port = port;
  self._address = host;

  if (cb) {
    self.once('connect', cb);
  }

  setImmediate(function () {
    self._restartTimeout();
    if (isIP(host)) {
      doConnect(host);
    } else {
      dns.resolve(host, function onResolve(err, ips) {
        if (err) {
          return self.emit('error', err);
        }
        self._restartTimeout();
        doConnect(ips[0]);
      })
    }
    var retries = 0;
    function doConnect(ip) {
      var unsplitIp = ip;
      ip = ip.split('.').map(Number);

      var ret = tm.tcp_connect(self.socket, ip[0], ip[1], ip[2], ip[3], port);
      if (ret >= 1) {
        // we're not connected to the internet
        return self.emit('error', new Error("Lost connection"));
      }
      if (ret < 0) {
        tm.tcp_close(self.socket); // -57
        if (retries > 3) {
          return self.emit('error', new Error('ENOENT Cannot connect to ' + ip.join('.') + ' Got: err'+ret));
        } else {
          retries++;
          setTimeout(function(){
            // wait for tcp socket to actually close
            self.socket = tm.tcp_open();
            doConnect(unsplitIp);
          }, 100);
          return;
        }
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
            return self.emit('error', new Error('CERT_HAS_EXPIRED'));
          } else if (ret == -516) {
            return self.emit('error', new Error('CERT_NOT_YET_VALID'));
          } else {
            return self.emit('error', new Error('Could not validate SSL request (error ' + ret + ')'));
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
          return self.emit('error', new Error('Hostname/IP doesn\'t match certificate\'s altnames'));
        }

        self._ssl = ssl;
      }

      self._restartTimeout();
      self.__listen();
      self.connected = true;
      self.emit('connect');
      self.__send();
    }
  });
};

TCPSocket.prototype._read = function (size) {
  // TODO: start polling it again
}

TCPSocket.prototype.__listen = function () {
  var self = this;
  this.__listenid = setTimeout(function loop () {
    self.__listenid = null;
    // ~HACK: set a watchdog to fire end event if not re-polled
    var failsafeEnd = setImmediate(function () {
      self.emit('end');
    });

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
      // self.emit('error', new Error('Socket closed.'));
      self.destroy();
      return;
    }

    if (buf.length) {
      self._restartTimeout();
      self.push(buf);
      // TODO: stop polling if this returns false
    }

    self.__listenid = setTimeout(loop, 10);
    clearImmediate(failsafeEnd);
  }, 10);
};

TCPSocket.prototype.address = function () {
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
  this.__send(cb);
};

TCPSocket.prototype.__send = function (cb) {
  if (this._sending || !this._outgoing.length || !this.connected) {
    if (this._queueEnd) {
      // close actual socket
      this._queueEnd = false;
      this.__close();
    }
    return cb ? cb() : false;
  }
  this._sending = true;

  var self = this;
  var buf = this._outgoing.shift();
  (function send () {
    if (self.socket == null) {
      // most likely we ran out of memory or needed to send an EWOULDBLOCK / EAGAIN
      // however res.end got called before we successfully recovered
      // so now the socket is closed, gg
      return cb();
    }

    var ret = null;
    if (self._ssl) {
      ret = tm.ssl_write(self._ssl, buf, buf.length);
    } else {
      ret = tm.tcp_write(self.socket, buf, buf.length);
    }

    if (ret == null) {
      return self.emit('error', new Error('Never sent data over socket'));
    } else if (ret == -2) {
      // cc3000 ran out of buffers. wait until a buffer clears up to send this packet.
      setTimeout(function() {
        // call select to listen for CC3k clearing mem
        tm.tcp_readable(self.socket);
        send();
      }, 100);
    } else if (ret == -11) {
      // EWOULDBLOCK / EAGAIN
      setTimeout(send, 100);
    } else if (ret < 0) {
      return self.emit('error', new Error("Socket write failed unexpectedly! ("+ret+")"));
    } else {
      self._restartTimeout();
      // Next buffer.
      self._sending = false;
      self.__send(cb);
    }
  })();
}

TCPSocket.prototype.__close = function () {
  var self = this;
  process.removeListener('tcp-close', self._closehandler);
  tm.tcp_close(self.socket);
  self.socket = null;
  self.emit('close');
}

TCPSocket.prototype.destroy = TCPSocket.prototype.close = function () {
  var self = this;
  setImmediate(function () {
    if (self.__listenid != null) {
      clearInterval(self.__listenid);
      self.__listenid = null
      self.emit('end')
    }
    if (self.socket != null) {

      // if there is still data left, wait until its sent before we end
      if (self._outgoing.length || self._sending) {
        self._queueEnd = true;
      } else {
        self.__close();
      }
      
    }
  });
};

TCPSocket.prototype.setTimeout = function (msecs, cb) {
  this._timeout = msecs;
  this._restartTimeout();
  if (cb) {
    if (msecs) this.once('timeout', cb);
    else this.removeListener('timeout', cb);   // not documented, but node.js does this
  }
};
TCPSocket.prototype._restartTimeout = function () {
  var self = this;
  clearTimeout(self._timeoutWatchdog);
  this._timeoutWatchdog = (self._timeout) ? setTimeout(function () {
    self.emit('timeout');
  }, self._timeout) : null;
}


// NOTE: CC3K may not support? http://e2e.ti.com/support/wireless_connectivity/f/851/p/349461/1223801.aspx#1223801
TCPSocket.prototype.setNoDelay = function (val) {
  if (val) console.warn("Ignoring call to setNoDelay. TCP_NODELAY socket option not supported.");
};

function connect (port, host, callback, _secure) {
  var client = new TCPSocket(null, _secure);
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

TCPServer.prototype.listen = function (port, host, backlog, cb) {
  if (typeof port === 'string') {
    throw Error("UNIX sockets not supported");
  }
  
  if (typeof host === 'function') {
    cb = host;
    host = null;    // NOTE: would be INADDR_ANY, but we ignore…
    backlog = 511;  // NOTE: also ignored
  } else if (typeof host === 'number') {
    backlog = host;
    host = null;
  }
  
  if (typeof backlog === 'function') {
    backlog = 511;
    cb = backlog;
  }
  
  this._port = TCPSocket._requestPort(port);
  this._address = host;
  if (cb) this.once('listening', cb);
  
  var self = this,
      res = tm.tcp_listen(this.socket, this._port);
  if (res < 0) setImmediate(function () {
    self.emit('error', new Error("Listen on TCP socket failed ("+res+")"));
  }); else setImmediate(function () {
    self.emit('listening');
    poll();
  });
  
  function poll(){
    // stop polling if we get closed
    if (self.socket === null) return;
    
    var _ = tm.tcp_accept(self.socket)
      , client = _[0]
      , ip = _[1];

    if (client >= 0) {
      var clientsocket = new TCPSocket(client);
      clientsocket.connected = true;
      clientsocket.__listen();
      self.emit('connection', clientsocket);
    }

    setTimeout(poll, 10);
  }
};

function createServer (opts, onsocket) {
  if (typeof opts === 'function') {
    onsocket = opts;
    opts = null;
  }
  if (opts && opts.allowHalfOpen) console.warn("Ignoring allowHalfOpen option.");
  var server = new TCPServer(tm.tcp_open());
  onsocket && server.on('connection', onsocket);
  return server;
};


/**
 * Public API
 */

exports.isIP = isIP;
exports.isIPv4 = isIPv4;
exports.isIPv6 = isIPv6;
exports.connect = exports.createConnection = connect;
exports.createServer = createServer;
exports.Socket = TCPSocket;
exports.Server = TCPServer;
