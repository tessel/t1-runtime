// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var dns = require('dns');
var isIP = require('net').isIP;
var tm = process.binding('tm');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function UDP (opts, cb) {
  if (typeof opts === 'string') {
    opts = {type:opts};
  } else if (opts == null) {
    throw new Error("You must provide a type string or options dictionary.");
  }
  if (opts.type !== 'udp4') {
    throw new Error("ENOSYS: 'udp4' is the only supported type.");
  }
  
  this._fd = tm.udp_open();
  if (cb) this.on('message', cb);
}

util.inherits(UDP, EventEmitter);


UDP.prototype.bind = function (port, addr, cb) {
  if (this._closed) throw new Error("EINVAL: socket closed");
  if (typeof addr === 'function') {
    cb = addr;
    addr = null;
  }
  var self = this;
  var ret = tm.udp_listen(this._fd, port || 0);
  if (ret < 0) {
    var err = "ENOENT: Cannot listen to socket.";
    if (ret == -tm.ENETUNREACH) {
      err = "ENETUNREACH: Wifi is not connected.";
    }
    setImmediate(function () {
      self.emit('error', new Error(err));
    });
    return;
  }
  
  this._boundPort = port;
  this._listenid = setTimeout(function poll () {
    self._listenid = null;
    if (self._fd == null) {
      return;
    }

    var r;
    while ((r = tm.udp_readable(self._fd))) {
      var ret = tm.udp_receive(self._fd),
          msg = ret[0],
          addr = ret[1],
          port = ret[2];
      self.emit('message', msg, {
        address: [addr >>> 24, (addr >>> 16) & 0xFF, (addr >>> 8) & 0xFF, addr & 0xFF].join('.'),
        family: 'IPv4',
        port: port
      });
    }
    self._listenid = setTimeout(poll);
  }, 100);
  
  setImmediate(function () {
    cb && cb();
    self.emit('listening');
  });
}

UDP.prototype.address = function () {
  if (this._boundPort != null) return {
    address: "0.0.0.0",
    family: 'IPv4',
    port: this._boundPort
  }
  else throw new Error("EINVAL: socket not bound");
}


UDP.prototype.send = function (text, offset, len, port, host, cb) {
  var self = this;

  if (this._boundPort == null) {
    // TODO 0 on PC build
    this.bind(7000);
  }

  setImmediate(function () {
    if (isIP(host)) {
      doConnect(host);
    } else {
      dns.resolve(host, function onResolve(err, ips) {
        if (err) {
          cb && cb(err);
          return self.emit('error', err);
        }
        doConnect(ips[0]);
      });
    }

    function doConnect(ip) {
      var addr = ip.split('.').map(Number);
      addr = (addr[0] << 24) | (addr[1] << 16) | (addr[2] << 8) | addr[3];
      
      var buf = Buffer.isBuffer(text) ? text : new Buffer(text);
      buf = buf.slice(offset, len);
      var err = tm.udp_send(self._fd, addr, port, buf);
      if (err) err = new Error("Send error: "+err);
      cb && cb(err);
    }
  });
}

UDP.prototype.close = function () {
  tm.udp_close(this._fd);
  this._fd = null;
  this._closed = true;
  if (this._listenid) {
    clearTimeout(this._listenid);
    this._listenid = null;
  }
}

exports.Socket = UDP;

exports.createSocket = function (opts, cb) {
  return new UDP(opts, cb);
};
