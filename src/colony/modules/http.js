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
var PassThrough = require('stream').PassThrough;

// NOTE: from https://github.com/joyent/node/blob/73343d5ceef7cb4ddee1ed0ddd2c51d1958e3bb1/lib/_http_server.js#L40
var STATUS_CODES = {
  100 : 'Continue',
  101 : 'Switching Protocols',
  102 : 'Processing',                 // RFC 2518, obsoleted by RFC 4918
  200 : 'OK',
  201 : 'Created',
  202 : 'Accepted',
  203 : 'Non-Authoritative Information',
  204 : 'No Content',
  205 : 'Reset Content',
  206 : 'Partial Content',
  207 : 'Multi-Status',               // RFC 4918
  300 : 'Multiple Choices',
  301 : 'Moved Permanently',
  302 : 'Moved Temporarily',
  303 : 'See Other',
  304 : 'Not Modified',
  305 : 'Use Proxy',
  307 : 'Temporary Redirect',
  308 : 'Permanent Redirect',         // RFC 7238
  400 : 'Bad Request',
  401 : 'Unauthorized',
  402 : 'Payment Required',
  403 : 'Forbidden',
  404 : 'Not Found',
  405 : 'Method Not Allowed',
  406 : 'Not Acceptable',
  407 : 'Proxy Authentication Required',
  408 : 'Request Time-out',
  409 : 'Conflict',
  410 : 'Gone',
  411 : 'Length Required',
  412 : 'Precondition Failed',
  413 : 'Request Entity Too Large',
  414 : 'Request-URI Too Large',
  415 : 'Unsupported Media Type',
  416 : 'Requested Range Not Satisfiable',
  417 : 'Expectation Failed',
  418 : 'I\'m a teapot',              // RFC 2324
  422 : 'Unprocessable Entity',       // RFC 4918
  423 : 'Locked',                     // RFC 4918
  424 : 'Failed Dependency',          // RFC 4918
  425 : 'Unordered Collection',       // RFC 4918
  426 : 'Upgrade Required',           // RFC 2817
  428 : 'Precondition Required',      // RFC 6585
  429 : 'Too Many Requests',          // RFC 6585
  431 : 'Request Header Fields Too Large',// RFC 6585
  500 : 'Internal Server Error',
  501 : 'Not Implemented',
  502 : 'Bad Gateway',
  503 : 'Service Unavailable',
  504 : 'Gateway Time-out',
  505 : 'HTTP Version Not Supported',
  506 : 'Variant Also Negotiates',    // RFC 2295
  507 : 'Insufficient Storage',       // RFC 4918
  509 : 'Bandwidth Limit Exceeded',
  510 : 'Not Extended',               // RFC 2774
  511 : 'Network Authentication Required' // RFC 6585
};


/**
 * IncomingMessage
 */
 
function IncomingMessage (type, connection) {     // type is 'request' or 'response'
  Readable.call(this);

  this.headers = {};
  this.trailers = {};
  this.rawHeaders = [];
  this.rawTrailers = [];
  this.socket = this.connection = connection;
  this.setTimeout = this.socket.setTimeout.bind(this.socket);

  function js_wrap_function (fn) {
    return function () {
      return fn.apply(null, [this].concat(arguments));
    }
  }

  var self = this;
  var parser = http_parser.new('request', {
    onMessageBegin: js_wrap_function(function () {
      self.emit('_messageBegin');
    }),
    onUrl: js_wrap_function(function (url) {
      self.url = url;
    }),
    onHeaderField: js_wrap_function(function (field) {
      // TODO: will http_parser actually emit this for trailers?
      var arr = (self._complete) ? self.rawTrailers : self.rawHeaders;
      arr.push(field);
    }),
    onHeaderValue: js_wrap_function(function (value) {
      var arr = (self._complete) ? self.rawTrailers : self.rawHeaders,
          key = arr[arr.length - 1].toLowerCase();
      arr.push(value);
      var obj = (self._complete) ? self.trailers : self.headers;
      IncomingMessage._addHeaderLine(_key, value, obj);
    }),
    onHeadersComplete: js_wrap_function(function (info) {
      self.method = info.method;
      self.statusCode = info.status_code;
      self.httpVersionMajor = info.version_major;
      self.httpVersionMinor = info.version_minor;
      self.httpVersion = [self.httpVersionMajor, self.httpVersionMinor].join('.');
      self.emit('_headersComplete');
    }),
    onBody: js_wrap_function(function (body) {
      self.push(body);
    }),
    onMessageComplete: js_wrap_function(function () {
      self._complete = true;
      self.push(null);
    }),
    onError: js_wrap_function(function (err) {
      self.emit('error', err);
    })
  });
  this.connection.on('data', function (data) {
    data = data.toString('utf8');     // TODO: this is almost certainly wrong! ('binary' or fix wrapper)
console.log("RECEIVED:", data);
    // console.log('received', data.length, data.substr(0, 15));
    parser.execute(data, 0, data.length);
  });
}

util.inherits(IncomingMessage, Readable);

// TODO: IncomingMessage is kind of a Transform on net.Socket, could we leverage that somehow?
//       Otherwise we need to either pause/resume net socket, or this.connection.read instead let flow.
//       [Put differently: we need to get some clarity as to what is streams1 vs. streams2 here and in net!]
IncomingMessage.prototype._read = function () {};


// NOTE: from https://github.com/joyent/node/blob/a454063ea17f94a5d456bb2666502076c0d51795/lib/_http_incoming.js#L143
IncomingMessage._addHeaderLine = function(field, value, dest) {
  field = field.toLowerCase();
  switch (field) {
    // Array headers:
    case 'set-cookie':
      if (!util.isUndefined(dest[field])) {
        dest[field].push(value);
      } else {
        dest[field] = [value];
      }
      break;

    // list is taken from:
    // https://mxr.mozilla.org/mozilla/source/netwerk/protocol/http/src/nsHttpHeaderArray.cpp
    case 'content-type':
    case 'content-length':
    case 'user-agent':
    case 'referer':
    case 'host':
    case 'authorization':
    case 'proxy-authorization':
    case 'if-modified-since':
    case 'if-unmodified-since':
    case 'from':
    case 'location':
    case 'max-forwards':
      // drop duplicates
      if (util.isUndefined(dest[field]))
        dest[field] = value;
      break;

    default:
      // make comma-separated list
      if (!util.isUndefined(dest[field]))
        dest[field] += ', ' + value;
      else {
        dest[field] = value;
      }
  }
};

/**
 * OutgoingMessage
 */

function OutgoingMessage (type) {     // type is 'request' or 'response', connection is socket
  Writable.call(this);
  
  this.sendDate = true;
  this._chunked = true;
  this._outbox = new PassThrough();   // buffer w/backpressure
  this._headers = {};
  this._headerNames = {};   // store original case
  
  var self = this;
  this.once('finish', function () {
    if (!self.headersSent) {
      self._chunked = false;
      self.flush();
    }
    if (this._chunked) self._outbox.write('0\r\n');
  });
}

util.inherits(OutgoingMessage, Writable);

OutgoingMessage.prototype._assignSocket = function (socket) {
  this._outbox.pipe(socket);
  this.emit('socket', socket);
  // TODO: setTimeout/setNoDelay/setSocketKeepAlive
};

OutgoingMessage.prototype.getHeader = function (name) {
  var k = name.toLowerCase();
  return this._headers[k];
};
OutgoingMessage.prototype.setHeader = function (name, value) {
  if (this.headersSent) throw Error("Can't setHeader after they've been sent!");
  var k = name.toLowerCase();
  this._headerNames[k] = name;
  this._headers[k] = value;
};
OutgoingMessage.prototype.removeHeader = function (name) {
  if (this.headersSent) throw Error("Can't removeHeader after they've been sent!");
  var k = name.toLowerCase();
  delete this._headerNames[k];
  delete this._headers[k];
};

OutgoingMessage.prototype.flush = function () {
  var lines = [];
  if (this._request) lines.push(this._request);
  else lines.push(['HTTP/1.1', this.statusCode, this.statusMessage || STATUS_CODES[this.statusCode] || ''].join(' '));
  Object.keys(this._headers).forEach(function (k) {
    var key = this._headerNames[k],
        val = this._headers[k];
    if (Array.isArray(val)) val = val.join(', ');
    lines.push(key+': '+val);
    if (k === 'date') this.sendDate = +this.sendDate;
    else if (k === 'content-length') this._chunked = false;
    else if (k === 'transfer-encoding') this._chunked = 'explicit';
  }, this);
  if (this._chunked === true) lines.push('Transfer-Encoding: chunked');
  // NOTE: will be broken until https://github.com/tessel/runtime/issues/388
  if (this.sendDate === true) lines.push('Date: '+new Date().toUTCString());
  else this.sendDate = !!this.sendDate;   // HACK: don't expose signal above
  lines.push('','');
  
  function clean(str) { return str.replace(/\r\n/g, ''); }    // avoid response splitting
  this._outbox.write(lines.map(clean).join('\r\n'));
  this.headersSent = true;
};

OutgoingMessage.prototype._write = function (chunk, enc, cb) {
  if (!this.headersSent) this.flush();
  if (this._chunked) this._outbox.write(chunk.length.toString(16)+'\r\n');
  this._outbox.write(chunk, enc, cb);
};

/**
  * Agent
  */

function Agent (opts) {
  opts = util._extend({
    keepAlive: false,
    keepAliveMsecs: 1000,
    maxSockets: Infinity,
    maxFreeSockets: 256
  }, opts);
  
  this.maxSockets = opts.maxSockets;
  this.maxFreeSockets = opts.maxFreeSockets;
  this.sockets = {};
  this.freeSockets = {};
  this.requests = {};
}

Agent.prototype.destroy = function () {};

Agent.prototype.getName = Agent.prototype._getHost = function (opts) {
  // NOTE: this differs from node (omits localAddress)
  return opts.host+':'+opts.port;
};

Agent.prototype._hostQueues = function (host) {
  return {
    sockets: this.sockets[host] || (this.sockets[host] = []),
    freeSockets: this.freeSockets[host] || (this.freeSockets[host] = []),
    requests: this.requests[host] || (this.requests[host] = [])
  };
};

Agent.prototype._enqueueRequest = function (req, opts) {
  var host = this._getHost(opts);
  var socket = net.createConnection(opts, function () {
    req._assignSocket(socket);
  });
  return {host:host, release:function () {}};
  
  // TODO: finish actual implementation!
  var socket = null,
      host = this._getHost(opts),
      info = this._hostQueues(host);
  if (info.freeSockets.length) {
    socket = info.freeSockets.pop();
  } else if (info.sockets.length < this.maxSockets) {
    socket = net.createConnection(opts);
  }
  if (socket) {
    info.sockets.push(socket);
    req._assignSocket(socket);
  } else info.requests.push(req);
  return {release:function () {}};
};

exports.globalAgent = new Agent();


/**
  * ClientRequest
  */

function ClientRequest (opts) {
  if (typeof opts === 'string') opts = url.parse(opts);
  opts = util._extend({
    host: 'localhost',
    port: 80,
    method: 'GET',
    path: '/',
    headers: {},
    auth: null,
    agent: (void 0),
    keepAlive: false,
    keepAliveMsecs: 1000
  }, opts);
  if ('hostname' in opts) opts.host = opts.hostname;
  if (0 && opts.agent === false) ;    // TODO: "auto-close" agent?
  else if (!opts.agent) opts.agent = exports.globalAgent;
  
  OutgoingMessage.call(this, 'request');
  this._agent = opts.agent._enqueueRequest(this, opts);
  this._request = [opts.method, opts.path, 'HTTP/1.1'].join(' ');
  
  this.setHeader('Host', this._agent.host);
  Object.keys(opts.headers).forEach(function (k) {
    this.setHeader(k, opts.headers[v]);
  });
  
  var self = this;
  this.once('socket', function (socket) {
    var response = new IncomingMessage('response', socket);
    response.once('_headersComplete', function () {
        var handled = self.emit('response', response);
        if (!handled) response.resume();    // dump it
    });
    response.once('end', function () {
      self._agent.release();
    });
  });
}

util.inherits(ClientRequest, OutgoingMessage);

ClientRequest.prototype.abort = function () {};

exports.request = function (opts, cb) {
  var req = new ClientRequest(opts);
  if (cb) req.once('response', cb);
  return req;
};

exports.get = function (opts, cb) {
  var req = exports.request(opts, cb);
  req.end();
  return req;
};



/**
 * ServerResponse
 */

function ServerResponse (req, connection) {
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
  this.connection.write('HTTP/1.1 ' + status + ' OK\r\n');
  this._usesContentLength = false;
  for (var key in this.headers) {
    if (key.toLowerCase() == 'content-length') {
      this._usesContentLength = true;
    }
    this.connection.write(key + ': ' + this.headers[key] + '\r\n');
  }
  if (!this._usesContentLength) {
    this.connection.write('Transfer-Encoding: chunked\r\n');
  }
  this.connection.write('\r\n');
  this._header = true;
};

ServerResponse.prototype._write = function (chunk, encoding, callback) {
  if (!this._header) {
    this.writeHead(200);
  }

  if (!this._usesContentLength) {
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
  return this.headers[key.toLowerCase()];
};

ServerResponse.prototype.end = function (data) {
  var self = this;
  if (!this._header) {
    this.writeHead(200);
  }

  if (data != null) {
    this.write(data);
  }
  this._closed = true;
  
  if (!this._usesContentLength) {
    // writes the ("0/r/n/r/n")
    this.write('');
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
    parser.execute(data, 0, data.length);
  })
}

util.inherits(ServerRequest, Readable);

ServerRequest.prototype._read = function(size){
  // no-op
}


function HTTPServer () {
  var self = this;
  this.connection = net.createServer(function (connection) {
    var request = new ServerRequest(connection);
    var response = new ServerResponse(request, connection);
    request.once('request', function () {
      self.emit('request', request, response)
    });
  });
}

util.inherits(HTTPServer, EventEmitter);

HTTPServer.prototype.listen = function (port, ip) {
  this.connection.listen(port, ip);
  return this;
};

HTTPServer.prototype.close = function(callback){
    this.connection.destroy();
    if(callback){
        callback();
    }
};


/**
 * HTTPIncomingResponse
 */

function HTTPIncomingResponse (connection) {
  Readable.call(this);
  this.headers = {};
  this.connection = connection;
}

util.inherits(HTTPIncomingResponse, Readable);

HTTPIncomingResponse.prototype._read = function () {
  // noop
};

HTTPIncomingResponse.prototype.setEncoding = function (encoding) {
  this.encoding = encoding;
};


/**
 * HTTPOutgoingRequest
 */

function HTTPOutgoingRequest (port, host, path, method, headers, _secure) {
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
 * Public API
 */

function ensureSecure (secure) {
  if (secure) {
    if (this._secure && !process.binding('tm').ssl_context_create) {
      throw new Error("SSL/TLS is not supported in this firmware build.");
    }
  }
}

exports._request_old = function (opts, onresponse) {
  ensureSecure(this._secure);
  if (opts.agent) {
    throw new Error('Agent not yet implemented.');
  }
  var host = opts.hostname || opts.host || 'localhost';
  var req = new HTTPOutgoingRequest(opts.port || (this._secure ? 443 : 80), host, opts.path || '', opts.method || 'GET', opts.headers || {}, this._secure);
  onresponse && req.on('response', onresponse);
  return req;
};

exports._get_old = function (opts, onresponse) {
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
exports.STATUS_CODES = STATUS_CODES;
