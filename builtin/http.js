var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');


/**
 * ServerResponse
 */

function ServerResponse (req, socket) {
  this.req = req;
  this.socket = socket;
  this.headers = {};
  this._closed = false;

  var self = this;
  this.req.on('close', function () {
    self._closed = true;
  })
}

// TODO stream
util.inherits(ServerResponse, EventEmitter);

ServerResponse.prototype.writeHead = function (status, headers) {
  // TODO
  this.socket.write('HTTP/1.1 ' + status + ' OK\r\n');
  if (headers) {
    for (var key in headers) {
      this.socket.write(key + ': ' + headers[key] + '\r\n');
    }
  }
  this.socket.write('Transfer-Encoding: chunked\r\n');
  this.socket.write('\r\n');
  // console.log('writing headers', headers);
};

ServerResponse.prototype.write = function (data) {
  this.socket.write(Number(data.length).toString(16));
  this.socket.write('\r\n');
  this.socket.write(data);
  this.socket.write('\r\n');
}

ServerResponse.prototype.end = function (data) {
  // TODO
  if (data != null) {
    this.write(data);
  }
  this._closed = true;
  this.socket.write('0\r\n\r\n');
  this.socket.close();
};


/**
 * HTTPIncomingRequest
 */

function HTTPIncomingRequest (socket) {
  var self = this;

  this.headers = {};
  this.socket = socket;

  var lastheader;
  var parser = new tm_http_parser('request', {
    on_message_begin: function () {
    },
    on_url: function (url) { },
    on_header_field: function (field) {
      lastheader = field;
    },
    on_header_value: function (value) {
      self.headers[lastheader.toLowerCase()] = value;
    },
    on_headers_complete: function () {
      self.emit('request', self);
    },
    on_body: function (body) {
      self.emit('data', body);
    },
    on_message_complete: function () {
      self.emit('close');
      self._closed = true;
      // TODO close
    },
    on_error: function (err) {
      self.socket.emit('error', err)
    }
  })
  this.socket.on('data', function (data) {
    // console.log('received', data.length, data.substr(0, 15));
    parser.write(data);
  })
}

util.inherits(HTTPIncomingRequest, EventEmitter);




function HTTPServer () {
  var self = this;
  this.socket = net.createServer(function (socket) {
    var request = new HTTPIncomingRequest(socket);
    var response = new ServerResponse(request, socket);
    request.on('request', function () {
      self.emit('request', request, response)
    });
  });
}

util.inherits(HTTPServer, EventEmitter);

HTTPServer.prototype.listen = function (port, ip) {
  this.socket.listen(port, ip);
};


/**
 * HTTPIncomingResponse
 */

function HTTPIncomingResponse (data) {
  this.headers = {};
}

// TODO stream
util.inherits(HTTPIncomingResponse, EventEmitter);

HTTPIncomingResponse.prototype.setEncoding = function () {
  // TODO
};


/**
 * HTTPOutgoingRequest
 */

function HTTPOutgoingRequest (port, host, path, method) {
  var ipl = tm_hostname_lookup(host);
  if (ipl == 0) {
    throw new Error('Could not lookup hostname.');
  }
  var ip = [(ipl >> 0) & 0xFF, (ipl >> 8) & 0xFF, (ipl >> 16) & 0xFF, (ipl >> 24) & 0xFF].join('.');

  var self = this;
  this.socket = net.connect(port, ip, function () {
    self.socket.write(method + ' /' + path + ' HTTP/1.1\r\nHost: ' + host + '\r\n\r\n');
    // self.emit('connect');
  })

  var response, lastheader;
  var parser = new tm_http_parser('response', {
    on_message_begin: function () {
      response = new HTTPIncomingResponse();
    },
    on_url: function (url) { },
    on_header_field: function (field) {
      lastheader = field;
    },
    on_header_value: function (value) {
      response.headers[lastheader.toLowerCase()] = value;
    },
    on_headers_complete: function () {
      console.log(response);
      self.emit('response', response);
    },
    on_body: function (body) {
      response.emit('data', body);
    },
    on_message_complete: function () {
      response.emit('close');
      // TODO close
      self.socket.close();
    },
    on_error: function (err) {
      self.socket.emit('error', err)
    }
  })
  this.socket.on('data', function (data) {
    parser.write(data);
  })
}

util.inherits(HTTPOutgoingRequest, EventEmitter);

HTTPOutgoingRequest.prototype.end = function () {
  // TODO
  // console.log('end');
};


/**
 * Public API
 */

exports.request = function (opts, onresponse) {
  var req = new HTTPOutgoingRequest(opts.port || 80, opts.hostname, opts.path || '', opts.method || 'GET');
  onresponse && req.on('response', onresponse);
  return req;
};

exports.createServer = function (onrequest) {
  var server = new HTTPServer();
  onrequest && server.on('request', onrequest);
  return server;
};

exports.ServerResponse = ServerResponse;