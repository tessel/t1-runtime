// NOTE: keeping separate for quicker standalone testing right now

var util = require('util'),
    stream = require('stream'),
    events = require('events'),
//    net = require('net');
    net = require("./net.js");


var PROXY_TOKEN = "DEV-CRED",
    PROXY_LOCAL = "10.0.0.0/8 172.16.0.0/12 192.168.0.0/16 169.254.0.0/16";

/**
 * Temporary tunnel globals
 */
 
function createTunnel(tokenServer, proxyServer, cb) {
  var streamplex = require('streamplex');
  
  var tokenSocket = connect(tokenServer, function () {
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

//var tunnel,
//    emitter = new events.EventEmitter();
//createTunnel({port:5006}, {port:5005}, function (e, _tunnel) {
//    if (e) return console.error(e);
//    tunnel = _tunnel;
//    emitter.emit('ready');
//});


function protoForConnection(host, port, cb) {   // CAUTION: this may callback syncronously!
console.log("HOST??", host)
    cb(null, net._CC3KSocket.prototype);
}

/**
 * ProxiedSocket
 */

function ProxiedSocketConstructor() {
    return tunnel.createStream();
}

function ProxiedSocket(opts) {
    Socket.call(this);
}
util.inherits(ProxiedSocket, net.Socket);

ProxiedSocket.prototype.connect = function (port, host, cb) {
    if (typeof host === 'function') {
        cb = host;
        host = null;      // 'localhost' not useful here…
    }
    // NOTE: avoid sending garbage, but proxy must still guard itself properly!
    if (typeof host !== 'string') throw Error("Host string must be provided");
    if (typeof port !== 'number') throw Error("Port number must be provided");
    this.remoteEmit('_pls_connect', port, host);
    if (cb) this.on('connect', cb);
};


exports._protoForConnection = protoForConnection;