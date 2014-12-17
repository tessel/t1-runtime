// NOTE: keeping separate for quicker standalone testing right now

var util = require('util'),
    stream = require('stream'),
    events = require('events'),
    connect = require('net').connect;

/**
 * Socket
 */

function Socket(opts) {
  stream.Duplex.call(this, opts);
}
util.inherits(Socket, stream.Duplex);



/**
 * ProxiedSocket
 */
 
 
function createTunnel(tokenServer, proxyServer, cb) {
  var streamplex = require('streamplex');
  
  var tokenSocket = connect(tokenServer, function () {
      var token = [];
      tokenSocket.write("DEV-CRED");
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

var tunnel,
    emitter = new events.EventEmitter();
createTunnel({port:5006}, {port:5005}, function (e, _tunnel) {
    if (e) return console.error(e);
    tunnel = _tunnel;
    emitter.emit('ready');
});

function ProxiedSocket(opts) {
  return tunnel.createStream();
}
util.inherits(ProxiedSocket, Socket);

module.exports = emitter;

exports.createConnection = function (opts, cb) {
  var socket = new ProxiedSocket();
  if (cb) socket.on('connect', cb);
  ProxiedSocket.prototype.connect.apply(socket, arguments);
  return socket;
};
