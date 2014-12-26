// NOTE: keeping separate for quicker standalone testing right now

var util = require('util'),
    stream = require('stream'),
    events = require('events'),
//    net = require('net');
    net = require("./net.js");


var PROXY_TOKEN = "DEV-CRED",
    // see also https://tools.ietf.org/html/rfc5735#section-4
    PROXY_LOCAL = "10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 169.254.0.0/16 127.0.0.0/8 localhost";

/**
 * Temporary tunnel globals
 */
 
function createTunnel(tokenServer, proxyServer, cb) {
  var streamplex = require('streamplex');
  
  var tokenSocket = net.connect(tokenServer, function () {
      var token = [];
      tokenSocket.write(PROXY_TOKEN);
      tokenSocket.on('data', function (chunk) {
          token.push(chunk);
      });
      tokenSocket.on('end', function () {
          token = Buffer.concat(token);
          if (!token.length) return cb(new Error("Credentials rejected (or token server down)."));
          
          var proxySocket = connect(proxyServer, function () {
              proxySocket.write(token);
              var tunnel = streamplex(streamplex.B_SIDE, {subclass:ProxiedSocket});
              tunnel.pipe(proxySocket).pipe(tunnel);
              cb(null, tunnel);
          });
          // TODO: more error handling, etc.
      });
  });
  tokenSocket.on('error', function (e) {
      tokenSocket.destroy();
      cb(e);
  });
}



var tunnelKeeper = new events.EventEmitter();

tunnelKeeper.getTunnel = function (cb) {    // CAUTION: syncronous callback!
    if (this._tunnel) return cb(null, this._tunnel);
    
    var self = this;
    if (!this._pending) createTunnel({port:5006}, {port:5005}, function (e, tunnel) {
      delete self._pending;
      self._tunnel = tunnel;
      self.emit('tunnel', e, tunnel);
    });
    this._pending = true;
    this.on('tunnel', cb);
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
      local = local_matchers.some(function (matcher) { return matcher(addr, host); });
  if (local) cb(null, net._CC3KSocket.prototype);
  else tunnelKeeper.getTunnel(function (e, tunnel) {
    if (e) return cb(e);
    opts.name = (opts._secure) ? 'tls' : 'net';
    cb(null, tunnel.createStream(opts));
  });
}

/**
 * ProxiedSocket
 */

function ProxiedSocket(opts) {
  // NOTE: only intended for instantiation via protoForConnection!
  Socket.call(this, opts);
}
util.inherits(ProxiedSocket, net.Socket);

ProxiedSocket.prototype._setup = function () {};

ProxiedSocket.prototype._connect = function (port, host) {
console.log("HERE", port, host);
  this.remoteEmit('_pls_connect', port, host);
};

exports._protoForConnection = protoForConnection;
