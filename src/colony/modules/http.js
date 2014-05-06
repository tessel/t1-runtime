var tm = process.binding('tm');
var http_parser = process.binding('http_parser');

var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var dns = require('dns');


/**
 * ServerResponse
 */

function ServerResponse (req, socket) {
  this.req = req;
  this.socket = socket;
  this.headers = {};
  this._header = false;
  this._closed = false;

  var self = this;
  this.req.on('close', function () {
    self._closed = true;
  })
}

// TODO stream
util.inherits(ServerResponse, EventEmitter);

ServerResponse.prototype.setHeader = function (name, value) {
  if (this._header) {
    throw "Already wrote HEAD";
  }
  this.headers[String(name).toLowerCase()] = value;
};

ServerResponse.prototype.setHeaders = function (headers) {
  for (var key in headers) {
    this.setHeader(key, headers[key]);
  }
};

ServerResponse.prototype.writeHead = function (status, headers) {
  if (this._header) {
    throw "Already wrote HEAD";
  }

  if (headers) {
    this.setHeaders(headers);
  }
  this.socket.write('HTTP/1.1 ' + status + ' OK\r\n');
  this._usesContentType = false;
  for (var key in this.headers) {
    if (key.toLowerCase() == 'content-length') {
      this._usesContentType = true;
    }
    this.socket.write(key + ': ' + this.headers[key] + '\r\n');
  }
  if (!this._usesContentType) {
    this.socket.write('Transfer-Encoding: chunked\r\n');
  }
  this.socket.write('\r\n');
  this._header = true;
  // console.log('writing headers', headers);
};

ServerResponse.prototype.write = function (data) {
  if (!this._header) {
    this.writeHead(200);
  }

  if (!this._usesContentType) {
    this.socket.write(Number(data.length).toString(16));
    this.socket.write('\r\n');
    this.socket.write(data);
    this.socket.write('\r\n');
  } else {
    this.socket.write(data);
  }
}

ServerResponse.prototype.getHeader = function (key) {
  return this.headers[key.toLowerCase()];
};

ServerResponse.prototype.end = function (data) {
  if (!this._header) {
    this.writeHead(200);
  }

  if (data != null) {
    this.write(data);
  }
  this._closed = true;
  if (!this._usesContentType) {
    this.socket.write('0\r\n\r\n');
  }
  this.socket.close();
};


/**
 * ServerRequest
 */

function ServerRequest (socket) {
  var self = this;

  this.headers = {};
  this.socket = socket;
  this.url = null;

  function js_wrap_function (fn) {
    return function () {
      return fn.apply(null, [this].concat(arguments));
    }
  }

  var lastheader;
  var parser = http_parser.new('request', {
    onMessageBegin: js_wrap_function(function () {
    }),
    onUrl: js_wrap_function(function (url) {
      self.url = url;
    }),
    onHeaderField: js_wrap_function(function (field) {
      lastheader = field;
    }),
    onHeaderValue: js_wrap_function(function (value) {
      self.headers[lastheader.toLowerCase()] = value;
    }),
    onHeadersComplete: js_wrap_function(function (info) {
      self.method = info.method;
      self.emit('request', self);
    }),
    onBody: js_wrap_function(function (body) {
      self.emit('data', body);
    }),
    onMessageComplete: js_wrap_function(function () {
      self.emit('close');
      self._closed = true;
      // TODO close
    }),
    onError: js_wrap_function(function (err) {
      self.socket.emit('error', err)
    })
  })
  this.socket.on('data', function (data) {
    // console.log('received', data.length, data.substr(0, 15));
    parser.execute(data, 0, data.length);
  })
}

util.inherits(ServerRequest, EventEmitter);




function HTTPServer () {
  var self = this;
  this.socket = net.createServer(function (socket) {
    var request = new ServerRequest(socket);
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

function isIP (host) {
  return host.match(/^[0-9.]+$/);
}

function HTTPOutgoingRequest (port, host, path, method, headers, _secure) {
  var self = this;

  if (!isIP(host)) {
    dns.resolve(host, onhost);
  } else {
    onhost(null, [host]);
  }

  function onhost (err, ips) {
    if (err) throw err;
    var ip = ips[0];

    if (path[0] != '/') {
      path = '/' + path;
    }

    self._connected = false;
    self._contentLength = 0;
    self.socket = net.connect(port, ip, function () {
      self._connected = true;
      var header = '';
      if (method != 'GET') {
        header = 'Content-Length: ' + self._contentLength + '\r\n';
      }
      var usedHost = false, usedUserAgent;
      for (var key in headers) {
        if (key.toLowerCase() == 'host') {
          usedHost = true;
        } else if (key.toLowerCase() == 'user-agent') {
          usedUserAgent = true;
        }
        header = header + key + ': ' + headers[key] + '\r\n';
      }
      if (!usedHost) {
        header = header + 'Host: ' + host + '\r\n'
      }
      if (!usedUserAgent) {
        header = header + 'User-Agent: tessel\r\n';
      }
      self.socket.write(method + ' ' + path + ' HTTP/1.1\r\n' + header + '\r\n');
      // self.emit('connect');
    }, _secure)

    self.socket.on('error', function (err) {
      self.emit('error', err);
    })

    function js_wrap_function (fn) {
      return function () {
        return fn.apply(null, [this].concat(arguments));
      }
    }

    var response, lastheader;
    var parser = http_parser.new('response', {
      onMessageBegin: js_wrap_function(function () {
        response = new HTTPIncomingResponse();
      }),
      onUrl: js_wrap_function(function (url) {
        // nop
      }),
      onHeaderField: js_wrap_function(function (field) {
        lastheader = field;
      }),
      onHeaderValue: js_wrap_function(function (value) {
        response.headers[lastheader.toLowerCase()] = value;
      }),
      onHeadersComplete: js_wrap_function(function (obj) {
        response.statusCode = obj.status_code
        self.emit('response', response);
      }),
      onBody: js_wrap_function(function (body) {
        response.emit('data', body);
      }),
      onMessageComplete: js_wrap_function(function () {
        response.emit('close');
        // TODO close
        self.socket.close();
      })
    })
    self.socket.on('data', function (data) {
      var nparsed = parser.execute(data, 0, data.length);
      if (nparsed != data.length) {
        self.socket.emit('error', 'Could not parse tokens at character #' + String(nparsed));
      }
    })
  };
}

util.inherits(HTTPOutgoingRequest, EventEmitter);

HTTPOutgoingRequest.prototype.write = function (data) {
  this._contentLength += data.length;
  if (this._connected) {
    this.socket.write(data);
  } else {
    this.socket.once('connect', function () {
      this.socket.write(data);
    }.bind(this))
  }
};

HTTPOutgoingRequest.prototype.end = function () {
  // TODO
  // console.log('end');
};


/**
 * Public API
 */

exports.request = function (opts, onresponse) {
  var host = opts.hostname || opts.host || 'localhost';
  var req = new HTTPOutgoingRequest(opts.port || (this._secure ? 443 : 80), host, opts.path || '', opts.method || 'GET', opts.headers || {}, this._secure);
  onresponse && req.on('response', onresponse);
  return req;
};

exports.get = function (opts, onresponse) {
  if (typeof opts == 'string') {
    opts = url.parse(opts);
    if (opts.query) {
      opts.path += '?' + opts.query;
    }
  }
  opts.method = 'GET';

  var req = this.request(opts, onresponse);
  req.end();
  return req;
};

exports.createServer = function (onrequest) {
  var server = new HTTPServer();
  onrequest && server.on('request', onrequest);
  return server;
};

exports.ServerResponse = ServerResponse;
exports.ServerRequest = ServerRequest;

exports.IncomingMessage = ServerResponse;
