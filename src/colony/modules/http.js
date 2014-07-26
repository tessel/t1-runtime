// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var tm = process.binding('tm');
var http_parser = process.binding('http_parser');

var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var dns = require('dns');
var Readable = require('stream').Readable;
var Writable = require('stream').Writable;


/**
 * ServerResponse
 */

function ServerResponse (req, connection) {
  console.log('you hit http ServerResponse');
  Writable.call(this);
  this.req = req;
  this.connection = connection;
  this.headers = {};
  this._header = false;
  this._closed = false;

  var self = this;
  this.req.on('end', function () {
    self._closed = true;
  })
  this.req.on('close', function () {
    self._closed = true;
  })
}

// TODO stream
util.inherits(ServerResponse, Writable);

ServerResponse.prototype.setHeader = function (name, value) {
  console.log('you hit http setHeader');
  if (this._header) {
    throw "Already wrote HEAD";
  }
  this.headers[String(name).toLowerCase()] = value;
};

ServerResponse.prototype.setHeaders = function (headers) {
  console.log('you hit http setHeaders');
  for (var key in headers) {
    this.setHeader(key, headers[key]);
  }
};

ServerResponse.prototype.writeHead = function (status, headers) {
  console.log('you hit http writeHead');

  if (this._header) {
    throw "Already wrote HEAD";
  }

  if (headers) {
    this.setHeaders(headers);
  }
  this.connection.write('HTTP/1.1 ' + status + ' OK\r\n');
  this._usesContentType = false;
  for (var key in this.headers) {
    if (key.toLowerCase() == 'content-length') {
      this._usesContentType = true;
    }
    this.connection.write(key + ': ' + this.headers[key] + '\r\n');
  }
  if (!this._usesContentType) {
    this.connection.write('Transfer-Encoding: chunked\r\n');
  }
  this.connection.write('\r\n');
  this._header = true;
};

ServerResponse.prototype._write = function (chunk, encoding, callback) {
  console.log('you hit http _write');
  if (!this._header) {
    this.writeHead(200);
  }
  console.log('chunk', chunk);

  if (!this._usesContentType) {
    // concatting buffer
    var buf = null;
    if (Buffer.isBuffer(chunk)) {
      buf = Buffer.concat([
        new Buffer(Number(chunk.length).toString(16) + '\r\n'), 
        chunk, 
        new Buffer('\r\n')]);
    } else {
      buf = new Buffer(Number(chunk.length).toString(16) + '\r\n' + chunk + '\r\n');
    }

    this.connection.write(buf, encoding, callback);
  } else {
    this.connection.write(chunk, encoding, callback);
  }
}

ServerResponse.prototype.getHeader = function (key) {
  console.log('you hit http getHeader');
  return this.headers[key.toLowerCase()];
};

ServerResponse.prototype.end = function (data) {
<<<<<<< HEAD
  console.log('you hit http end');
=======
  var self = this;
>>>>>>> 3419d09ce27eac8804c0141ccfe3722c6de2d224
  if (!this._header) {
    this.writeHead(200);
  }

  if (data != null) {
    this.write(data);
  }
  this._closed = true;
  if (!this._usesContentType) {
    // force it to write ending chunk without a unique chunk header
    this._usesContentType = true; 
    this.write('0\r\n\r\n');
  }

  this.once('finish', function () { 
    self.connection.close();
  });

  Writable.prototype.end.call(self);
};


/**
 * ServerRequest
 */

function ServerRequest (connection) {
  console.log('you hit http ServerRequest');
  Readable.call(this);
  var self = this;

  this.headers = {};
  this.connection = connection;
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
      self.push(body);
    }),
    onMessageComplete: js_wrap_function(function () {
      self.push(null);
      self._closed = true;
      // TODO close
    }),
    onError: js_wrap_function(function (err) {
      self.connection.emit('error', err)
    })
  })
  this.connection.on('data', function (data) {
    data = data.toString('utf8');
    // console.log('received', data.length, data.substr(0, 15));
    parser.execute(data, 0, data.length);
  })
}

util.inherits(ServerRequest, Readable);




function HTTPServer () {
  console.log('you hit HTTPServer')
  var self = this;
  this.connection = net.createServer(function (connection) {
    var request = new ServerRequest(connection);
    var response = new ServerResponse(request, connection);
    request.on('request', function () {
      self.emit('request', request, response)
    });
  });
}

util.inherits(HTTPServer, EventEmitter);

HTTPServer.prototype.listen = function (port, ip) {
  console.log('you hit http listen');
  this.connection.listen(port, ip);
};


/**
 * HTTPIncomingResponse
 */

function HTTPIncomingResponse (connection) {
  console.log('you hit HTTPIncomingResponse');
  Readable.call(this);
  this.headers = {};
  this.connection = connection;
}

util.inherits(HTTPIncomingResponse, Readable);

HTTPIncomingResponse.prototype._read = function () {
  // noop
};

HTTPIncomingResponse.prototype.setEncoding = function (encoding) {
  console.log('you hit http setEncoding');
  this.encoding = encoding;
};


/**
 * HTTPOutgoingRequest
 */

function isIP (host) {
  return host.match(/^[0-9.]+$/);
}

function HTTPOutgoingRequest (port, host, path, method, headers, _secure) {
  console.log('you hit HTTPOutgoingRequest');
  console.log('path:', path);
  console.log('method:', method);
  console.log('headers:', headers);
  console.log('headers.host:', headers.Host);

  var self = this;

  if (path[0] != '/') {
    path = '/' + path;
  }

  self._connected = false;
  self._contentLength = 0;
  self.connection = net.connect(port, host, function () {
    self._connected = true;
    var header = '';
    var usedHost = false, usedUserAgent = false, usedContentLength = false;
    for (var key in headers) {
      if (key.toLowerCase() == 'host') {
        usedHost = true;
      } else if (key.toLowerCase() == 'user-agent') {
        usedUserAgent = true;
      } else if (key.toLowerCase() == 'content-length') {
        usedContentLength = true;
      }
      header = header + key + ': ' + headers[key] + '\r\n';
    }
    if (!usedHost) {
      header = header + 'Host: ' + host + '\r\n'
    }
    if (!usedUserAgent) {
      header = header + 'User-Agent: tessel\r\n';
    }
    if (!usedContentLength && method != 'GET') {
      header = header + 'Content-Length: ' + self._contentLength + '\r\n';
    }
    self.connection.write(method + ' ' + path + ' HTTP/1.1\r\n' + header + '\r\n');
    // self.emit('connect');
  }, _secure)

  self._outgoing = [];
  self.connection.once('connect', function () {
    for (var i = 0; i < self._outgoing.length; i++) {
      self.connection.write(self._outgoing[i]);
    }
    self._outgoing = [];
  })

  self.connection.on('error', function (err) {
    self.emit('error', err);
  })

  function js_wrap_function (fn) {
    console.log('you hit js_wrap_functiomn');
    return function () {
      return fn.apply(null, [this].concat(arguments));
    }
  }

  var response, lastheader, upgrade = false;
  var parser = http_parser.new('response', {
    onMessageBegin: js_wrap_function(function () {
      response = new HTTPIncomingResponse(self.connection);
      self.connection.on('close', function () {
        response.push(null);
        response = null;
      });
    }),
    onUrl: js_wrap_function(function (url) {
      // nop
    }),
    onHeaderField: js_wrap_function(function (field) {
      lastheader = field;
    }),
    onHeaderValue: js_wrap_function(function (value) {
      if (response) {
        response.headers[lastheader.toLowerCase()] = value;
      }
    }),
    onHeadersComplete: js_wrap_function(function (obj) {
      if (response) {
        response.statusCode = obj.status_code
      }
      if (obj.upgrade) {
        upgrade = true;
      } else {
        self.emit('response', response);
      }
    }),
    onBody: js_wrap_function(function (body) {
      if (!upgrade && response) {
        response.push(body);
      }
    }),
    onMessageComplete: js_wrap_function(function () {
      if (!upgrade && response) {
        self.connection.close();
      }
    })
  });
  self.connection.on('data', function listener (data) {
    data = data.toString('utf8');
    var nparsed = parser.execute(data, 0, data.length);
    if (upgrade) {
      self.emit('upgrade', response, self.connection, (Buffer.isBuffer(data) ? data : new Buffer(data)).slice(nparsed));
      self.connection.removeListener('data', listener);
    } else if (nparsed != data.length) {
      self.connection.emit('error', 'Could not parse tokens at character #' + String(nparsed));
    }
  });

  self.emit('connection', self.connection);
}

util.inherits(HTTPOutgoingRequest, EventEmitter);

HTTPOutgoingRequest.prototype.write = function (data) {
  console.log('you hit http write');
  this._contentLength += data.length;
  if (this._connected) {
    this.connection.write(data);
  } else {
    this._outgoing.push(data)
  }
};

HTTPOutgoingRequest.prototype.end = function () {
  // TODO
  // console.log('end');
};


/**
 * Agent
 */

function Agent () {
  // NYI
}


/**
 * Public API
 */

function ensureSecure (secure) {
  if (secure) {
    if (this._secure && !process.binding('tm').ssl_context_create) {
      throw new Error("SSL/TLS is not supported in this firmware build.");
    }
  }
}

exports.request = function (opts, onresponse) {
  console.log('you hit http request');
  ensureSecure(this._secure);
  if (opts.agent) {
    throw new Error('Agent not yet implemented.');
  }
  console.log('this is opts:',opts);
  console.log('opts path:', opts.path);
  var host = opts.hostname || opts.host || 'localhost';
  var req = new HTTPOutgoingRequest(opts.port || (this._secure ? 443 : 80), host, opts.path || '', opts.method || 'GET', opts.headers || {}, this._secure);
  onresponse && req.on('response', onresponse);
  console.log('req');
  return req;
};

exports.get = function (opts, onresponse) {
  console.log('you hit http get');
  if (typeof opts == 'string') {
    opts = url.parse(opts);
  }
  opts.method = 'GET';
  if (opts.agent) {
    throw new Error('Agent not yet implemented.');
  }

  var req = this.request(opts, onresponse);
  // req.end();
  return req;
};

function createServer (onrequest) {
  var server = new HTTPServer();
  onrequest && server.on('request', onrequest);
  return server;
};

exports.Server = exports.createServer = createServer;
exports.Agent = Agent;
exports.ServerResponse = ServerResponse;
exports.ServerRequest = ServerRequest;
exports.IncomingMessage = ServerRequest;
