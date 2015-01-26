var util = require('util'),
    events = require('events'),
    net = require('net'),
    tls = require('tls'),
    streamplex = require('_streamplex');

// NOTE: this list may not be exhaustive, see also https://tools.ietf.org/html/rfc5735#section-4
var _PROXY_LOCAL = "10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 169.254.0.0/16 127.0.0.0/8 localhost";

var PROXY_HOST = process.env.PROXY_HOST || "proxy.tessel.io",
    PROXY_PORT = process.env.PROXY_PORT || 443,
    PROXY_TOKEN = process.env.PROXY_TOKEN || process.env.TM_API_KEY,
    PROXY_LOCAL = process.env.PROXY_LOCAL || _PROXY_LOCAL,    
    PROXY_CERT = process.env.PROXY_CERT || [
      "-----BEGIN CERTIFICATE-----",
      "MIICazCCAdQCCQDr2mJoysZo9DANBgkqhkiG9w0BAQUFADB6MQswCQYDVQQGEwJV",
      "UzELMAkGA1UECBMCQ0ExETAPBgNVBAcTCEJlcmtlbGV5MQ8wDQYDVQQKEwZUZXNz",
      "ZWwxGDAWBgNVBAMTD3Byb3h5LnRlc3NlbC5pbzEgMB4GCSqGSIb3DQEJARYRdGVh",
      "bUB0ZWNobmljYWwuaW8wHhcNMTUwMTIzMDExOTQ5WhcNMTUwMjIyMDExOTQ5WjB6",
      "MQswCQYDVQQGEwJVUzELMAkGA1UECBMCQ0ExETAPBgNVBAcTCEJlcmtlbGV5MQ8w",
      "DQYDVQQKEwZUZXNzZWwxGDAWBgNVBAMTD3Byb3h5LnRlc3NlbC5pbzEgMB4GCSqG",
      "SIb3DQEJARYRdGVhbUB0ZWNobmljYWwuaW8wgZ8wDQYJKoZIhvcNAQEBBQADgY0A",
      "MIGJAoGBAMBZDd+DvwOxtCHl0tVYjctfoim7GvVrE257vofr7oi1SXGXf1ZPcPgb",
      "DDiq5zq5G38JaHNHpkUq5+J8XUNXgdITAm0Pj4RHwwIHejmWh7ZWRZqsxrz+E6T0",
      "aj+RIqe3wAfNmr4N7pZ8un9XL1abcTREOMdaLvsNBLhFSJOf3B2tAgMBAAEwDQYJ",
      "KoZIhvcNAQEFBQADgYEAbNbBFOe5P33FWUup35d/zUdU/q2j5xDGhMbyCVkdONh9",
      "QrjD9jStLIhaLOjXleI5S+TT9Vgqknn7D9Q977+/wTAg6aXwSBe1LK/V4du92eSx",
      "/stxtxpFH7BQ1YPuuzmIcYd8rGPywjV91fsgqmWIZFe7FHGbRqKNKPCeR3Nv4tg=",
      "-----END CERTIFICATE-----",
    ].join('\n');

/**
 * Temporary tunnel globals
 */
 
function createTunnel(cb) {
  net.connect({host:PROXY_HOST, port:PROXY_PORT, proxy:false}, function () {
  //tls.connect({host:PROXY_HOST, port:PROXY_PORT, proxy:false, ca:[PROXY_CERT]}, function () {
    var proxySocket = this,
        tunnel = streamplex(streamplex.B_SIDE);
    tunnel.pipe(proxySocket).pipe(tunnel);
    proxySocket.on('error', function (e) {
      tunnel.destroy(e);    // substreams will each emit `e`, then go inactive
    });
    tunnel.once('inactive', function () {
      proxySocket.destroy();
    });
    tunnel.sendMessage({token:PROXY_TOKEN});
    tunnel.once('message', function (d) {
      proxySocket.removeListener('error', cb);
      if (!d.authed) cb(new Error("Authorization failed."));
      else cb(null, tunnel);
    });
  }).on('error', cb);
}

var tunnelKeeper = new events.EventEmitter();

tunnelKeeper.getTunnel = function (cb) {    // CAUTION: syncronous callback!
    if (this._tunnel) return cb(null, this._tunnel);
    
    var self = this;
    if (!this._pending) createTunnel(function (e, tunnel) {
      delete self._pending;
      if (e) return self.emit('tunnel', e);
      
      self._tunnel = tunnel;
      tunnel.once('inactive', function () {
        self._tunnel = null;
      });
      var streamProto = Object.create(ProxiedSocket.prototype);
      streamProto._tunnel = tunnel;
      tunnel._streamProto = streamProto;
      self.emit('tunnel', null, tunnel);
    });
    this._pending = true;
    this.once('tunnel', cb);
};

var local_matchers = PROXY_LOCAL.split(' ').map(function (str) {
  var parts = str.split('/');
  if (parts.length > 1) {
    // IPv4 + mask
    var bits = +parts[1],
        mask = 0xFFFFFFFF << (32-bits) >>> 0,
        base = net._ipStrToInt(parts[0]) & mask;      // NOTE: left signed to match test below
    return function (addr, host) {
      return ((addr & mask) === base);
    };
  } else if (str[0] === '.') {
    // base including subdomains
    str = str.slice(1);
    return function (addr, host) {
      var idx = host.lastIndexOf(str);
      return (~idx && idx + str.length === host.length);
    };
  } else return function (addr, host) {
    // exact domain/address 
    return (host === str);
  }
});

function protoForConnection(host, port, opts, cb) {   // CAUTION: syncronous callback!
  var addr = (net.isIPv4(host)) ? net._ipStrToInt(host) : null,
      local = !PROXY_TOKEN || (opts.proxy === false) || local_matchers.some(function (matcher) { return matcher(addr, host); });
  if (local) cb(null, net._CC3KSocket.prototype);
  else tunnelKeeper.getTunnel(function (e, tunnel) {
    if (e) return cb(e);
    cb(null, tunnel._streamProto);
  });
}

/**
 * ProxiedSocket
 */

function ProxiedSocket(opts) {
  if (!(this instanceof ProxiedSocket)) return new ProxiedSocket(opts);
  net.Socket.call(this, opts);
  this._tunnel = this._opts.tunnel;
  this._setup(this._opts);
}
util.inherits(ProxiedSocket, net.Socket);

ProxiedSocket.prototype._setup = function () {
  var type = (this._secure) ? 'tls' : 'net';
  this._transport = this._tunnel.createStream(type);
  
  var self = this;
  // TODO: it'd be great if we is-a substream instead of has-a…
  this._transport.on('data', function (d) {
    var more = self.push(d);
    if (!more) self._transport.pause();
  });
  this._transport.on('end', function () {
    self.push(null);
  });
  
  function reEmit(evt) {
    self._transport.on(evt, function test() {
      var args = Array.prototype.concat.apply([evt], arguments);
      self.emit.apply(self, args);
    });
  }
  ['connect', 'secureConnect', 'error', 'timeout'].forEach(reEmit);
};

ProxiedSocket.prototype._read = function () {
  this._transport.resume();
};
ProxiedSocket.prototype._write = function (buf, enc, cb) {
  this._transport.write(buf, enc, cb);
};

ProxiedSocket.prototype._connect = function (port, host) {
  this.remotePort = port;
  this.remoteAddress = host;
  this._transport.remoteEmit('_pls_connect', port, host);
};

ProxiedSocket.prototype.setTimeout = function (msecs, cb) {
  this._transport.remoteEmit('_pls_timeout', msecs);
  if (cb) {
    if (msecs) this.once('timeout', cb);
    else this.removeListener('timeout', cb);
  }
};

ProxiedSocket.prototype.destroy = function () {
  this._transport.destroy();
  this.end();
};

exports._protoForConnection = protoForConnection;
