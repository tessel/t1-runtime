var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');


/**
 * HTTPResponse
 */

function HTTPResponse (data) {
  this.headers = {};

  var self = this;
  var parts = data.split('\r\n\r\n');
  setImmediate(function () {
    self.emit('data', parts[1] || '');
  })
}

util.inherits(HTTPResponse, EventEmitter);

HTTPResponse.prototype.setEncoding = function () {
  // TODO
};


/**
 * HTTPRequest
 */

function HTTPRequest (port, host, path) {
  var ipl = tm_hostname_lookup(host);
  if (ipl == 0) {
    throw new Error('Could not lookup hostname.');
  }
  var ip = [(ipl >> 0) & 0xFF, (ipl >> 8) & 0xFF, (ipl >> 16) & 0xFF, (ipl >> 24) & 0xFF].join('.');

  var self = this;
  this.socket = net.connect(port, ip, function () {
    self.socket.write('GET /' + path + ' HTTP/1.1\r\nHost: ' + host + '\r\n\r\n');
    // self.emit('connect');
  })
  this.socket.on('data', function (data) {
    self.emit('response', new HTTPResponse(data));
  })
}

util.inherits(HTTPRequest, EventEmitter);

HTTPRequest.prototype.end = function () {
  console.log('end');
};


/**
 * Public API
 */

exports.request = function (opts, onresponse) {
  var req = new HTTPRequest(opts.port || 80, opts.hostname, opts.path || '');
  onresponse && req.on('response', onresponse);
  return req;
};