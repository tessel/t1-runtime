// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var dns = require('dns');
var tm = process.binding('tm');

var EventEmitter = require('events').EventEmitter;

function UDP (socket) {
  this.socket = socket;
}

UDP.prototype = new EventEmitter();

UDP.prototype.bind = function (port, cb) {
  var self = this;

  this._bound = true;
  var ret = tm.udp_listen(this.socket, port || 0);
  if (ret < 0) {
    var err = "ENOENT: Cannot listen to socket.";
    if (ret == -tm.ENETUNREACH) {
      err = "ENETUNREACH: Wifi is not connected.";
    }
    self.emit('error', new Error(err));
    return;
  }

  this._listenid = setTimeout(function poll () {
    self._listenid = null;
    if (self.socket == null) {
      return;
    }

    var r;
    while ((r = tm.udp_readable(self.socket))) {
      var buf = tm.udp_receive(self.socket);
      self.emit('message', buf[0].slice(0, buf[1]));
    }

    self._listenid = setTimeout(poll);
  }, 100);

  cb && cb();
}

function isIP (host) {
  return host.match(/^[0-9.]+$/);
}

UDP.prototype.send = function (text, offset, len, port, host, cb) {
  var self = this;

  if (!this._bound) {
    // TODO 0 on PC build
    this.bind(7000);
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
      var ips = ip.split('.');
      var buf = Buffer.isBuffer(text) ? text : new Buffer(text);
      buf = buf.slice(offset, len);
      var ret = tm.udp_send(self.socket, ips[0], ips[1], ips[2], ips[3], port, buf);
      cb && cb(ret);
    }
  });
}

UDP.prototype.close = function () {
  tm.udp_close(this.socket);
  this.socket = null;
  this._closed = true;
  if (this._listenid) {
    clearTimeout(this._listenid);
    this._listenid = null;
  }
}

exports.createSocket = function () {
  return new UDP(tm.udp_open());
};
