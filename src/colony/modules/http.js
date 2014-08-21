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

// NOTE: transcribed from HTTP_METHOD_MAP in "deps/http-parser/http_parser.h"
var METHODS = [
  'DELETE', 'GET', 'HEAD', 'POST', 'PUT',
  'CONNECT', 'OPTIONS', 'TRACE',
  'COPY', 'LOCK', 'MKCOL', 'MOVE', 'PROPFIND', 'PROPPATCH', 'SEARCH', 'UNLOCK',
  'REPORT', 'MKACTIVITY', 'CHECKOUT', 'MERGE',
  'MSEARCH', 'NOTIFY', 'SUBSCRIBE', 'UNSUBSCRIBE',
  'PATCH', 'PURGE'
];

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

// WORKAROUND: https://github.com/tessel/runtime/issues/426
//var _closeRE = /\bclose\b/i;
var _closeRE = /close/i;


/**
 * IncomingMessage
 */
 
function IncomingMessage (type, socket) {
  Readable.call(this);

  this.headers = {};
  this.trailers = {};
  this.rawHeaders = [];
  this.rawTrailers = [];
  this.socket = this.connection = socket;
  // TODO: finish timeout forwarding/handling/cleanup! (and implement other occurences)
  this.setTimeout = socket.setTimeout.bind(socket);

  function js_wrap_function (fn) {
    return function () {
      return fn.apply(null, [this].concat(arguments));
    }
  }

  var self = this;
  var parser = http_parser.new(type, {
    onMessageBegin: js_wrap_function(function () {
      self.emit('_messageBegin');
    }),
    onUrl: js_wrap_function(function (url) {
      self.url = url;
    }),
    onHeaderField: js_wrap_function(function (field) {
      var arr = (self._headersComplete) ? self.rawTrailers : self.rawHeaders;
      arr.push(field);
    }),
    onHeaderValue: js_wrap_function(function (value) {
      var arr = (self._headersComplete) ? self.rawTrailers : self.rawHeaders,
          key = arr[arr.length - 1].toLowerCase();
      arr.push(value);
      var obj = (self._headersComplete) ? self.trailers : self.headers;
      IncomingMessage._addHeaderLine(key, value, obj);
    }),
    onHeadersComplete: js_wrap_function(function (info) {
      self.method = info.method;
      self.statusCode = info.status_code;
      self.httpVersionMajor = info.version_major;
      self.httpVersionMinor = info.version_minor;
      self.httpVersion = [self.httpVersionMajor, self.httpVersionMinor].join('.');
      self._headersComplete = true;
      self._upgrade = info.upgrade || self._upgrade;
      if (!self._upgrade) self.emit('_headersComplete');
      else self._unplug();
    }),
    onBody: js_wrap_function(function (body) {
      var glad = self.push(body);
      if (!glad) socket.pause();
    }),
    onMessageComplete: js_wrap_function(function () {
      self.push(null);
      self._unplug();
    })
  });
  function _emitError(e) {
    // NOTE: '_error' becomes ClientRequest 'error' or Server 'clientError'
    if (!e) e = new Error(parser.getErrorString());
    self.emit('_error', e);
  }
  function _emitClose() {
    self.emit('close');
  }
  function _handleData(d) {
    var nparsed = parser.execute(d.toString('binary'), 0, d.length);
    if (self._upgrade) self.emit('_upgrade', d.slice(nparsed));
    else if (nparsed !== d.length) _emitError();
  }
  function _handleEnd() {
    if (parser.finish() !== 0) _emitError();
    else self.push(null);
  }
  socket.on('error', _emitError);
  socket.on('close', _emitClose);
  socket.on('data', _handleData);
  socket.on('end', _handleEnd);
  
  // couple methods that are cleaner sharing closure
  this._restartParser = function () {
    delete self._headersComplete;
    parser.reinitialize(type);
  };
  this._unplug = function () {
    self.socket = self.connection = null;
    socket.removeListener('error', _emitError);
    socket.removeListener('close', _emitClose);
    socket.removeListener('data', _handleData);
    socket.removeListener('end', _handleEnd);
  };
  this._socket = socket;
}

util.inherits(IncomingMessage, Readable);

IncomingMessage.prototype._read = function () {
  this._socket.resume();
};

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

function OutgoingMessage () {
  Writable.call(this);
  
  this._keepAlive = true;
  this.sendDate = false;        // NOTE: ServerResponse changes default to true
  this._chunked = true;
  this._outbox = new PassThrough();   // buffer w/backpressure
  this._headers = {};
  this._headerNames = {};   // store original case
  this._trailer = '';
  
  var self = this;
  this.once('finish', function () {
    if (!self.headersSent) {
      self._chunked = false;
      self.flush();
    }
    if (this._chunked) self._outbox.write('0\r\n'+this._trailer+'\r\n');
  });
}

util.inherits(OutgoingMessage, Writable);

OutgoingMessage.prototype._assignSocket = function (socket) {
  // NOTE: so that error listeners can be registered immediately,
  //       new/idle sockets get assigned syncronously by Agent.
  //       ClientRequest re-emits a public event asyncronously.
  this.emit('_socket-SYNC', socket);
  this._outbox.pipe(socket);
  // TODO: setTimeout/setNoDelay/setSocketKeepAlive
};

OutgoingMessage.prototype._addHeaders = function (obj) {
  Object.keys(obj).forEach(function (k) {
    this.setHeader(k, obj[k]);
  }, this);
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

// helper used to avoid response splitting
function _stripCRLF(str) { return str.replace(/\r\n/g, ''); }

OutgoingMessage.prototype.flush = function () {
  var lines = [];
  lines.push(this._mainline);
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
  this._outbox.write(lines.map(_stripCRLF).join('\r\n'));
  this.headersSent = true;
};

OutgoingMessage.prototype.addTrailers = function (obj) {
  var lines = [];
  Object.keys(obj).forEach(function (k) {
    var key = k,
        val = obj[k];
    if (Array.isArray(val)) val = val.join(', ');
    lines.push(key+': '+val);
  });
  lines.push('');
  this._trailer = lines.map(_stripCRLF).join('\r\n');
};

OutgoingMessage.prototype._write = function (chunk, enc, cb) {
  if (!this.headersSent) this.flush();
  if (this._chunked) this._outbox.write(chunk.length.toString(16)+'\r\n');
  this._outbox.write(chunk, enc, cb);
  if (this._chunked) this._outbox.write('\r\n');
};

/**
  * Agent
  */

function Agent (opts) {
  opts = util._extend({
    keepAlive: false,
    keepAliveMsecs: 1000,
    maxSockets: 2,      // NOTE: node has `Infinity`
    maxFreeSockets: 1   // NOTE: node has `256`
  }, opts);
  
  this._keepAlive = opts.keepAlive;
  this.maxSockets = opts.maxSockets;
  this.maxFreeSockets = opts.maxFreeSockets;
  this.sockets = {};
  this.freeSockets = {};
  this.requests = {};
  this._pools = {};
  
}

Agent.prototype.destroy = function () {
  Object.keys(this._pools).forEach(function (k) {
    this._pools[k].destroy();
  }, this);
};

Agent.prototype.getName = function (opts) {
  // NOTE: this differs from node (omits localAddress)
  return opts.host+':'+opts.port;
};

function _getPool(agent, opts) {
  var host = agent.getName(opts);
  if (agent._pools[host]) return agent._pools[host];
  // ~HACK: turn the frustrating way node exposes internal state to a cleaner abstraction
  var pool = agent._pools[host] = {},
      sockets = agent.sockets[host] = [],
      freeSockets = agent.freeSockets[host] = [],
      requests = agent.requests[host] = [];
  
  function collectGarbage() {
    if (sockets.length || requests.length || freeSockets.length) return;
    // otherwise we're done; cleanup and force new pool instance
    delete agent.sockets[host];
    delete agent.freeSockets[host];
    delete agent.requests[host];
    delete agent._pools[host];
  }
  
  function handleIdleError() {
    // no-op; just avoid an uncaught event
    // (socket will fire close next and be)
    
    // NOTE: when sockets are in-use by client (or a server)
    //       the error is _always_ handled via the IncomingMessage!
    //       OutgoingMessage doesn't really get feedback on trouble.
  }
  
  
  function addSocket() {
    var socket = agent._createConnection(opts);
    socket.on('close', handleDead);
    socket.on('_free', handleFree);
    socket.once('agentRemove', function () {
      socket.removeListener('close', handleDead);
      socket.removeListener('_free', handleFree);
      removeSocket(socket);
    });
    
    function handleDead() { removeSocket(socket); }
    function handleFree() { updateSocket(socket); }
    return socket;
  }
  
  function updateSocket(socket) {
    if (requests.length) {
      var nextReq = requests.shift();   // FIFO
      nextReq._assignSocket(socket);
    } else {
      if (agent._keepAlive && freeSockets.length < agent.maxFreeSockets) {
        socket.on('error', handleIdleError);
        freeSockets.push(socket);
      } else socket.end();
      removeSocket(socket);
    }
  }
  
  function removeSocket(socket) {
    sockets.splice(sockets.indexOf(socket), 1);
    if (requests.length && sockets.length < agent.maxSockets) {
      addSocket().emit('_free');
    }
    collectGarbage();
  }
  
  pool.enqueueRequest = function (req) {
    var socket;
    if (freeSockets.length) {
      socket = freeSockets.shift();    // LRU
      socket.removeListener('error', handleIdleError);
    } else if (sockets.length < agent.maxSockets) {
      socket = addSocket();
    }
    if (socket) {
      sockets.push(socket);
      req._assignSocket(socket);
    } else requests.push(req);
  };
  
  pool.destroy = function () {
    sockets.forEach(function (s) { s.destroy(); });
    freeSockets.forEach(function (s) { s.destroy(); });
  };
  
  return pool;
}

Agent.prototype._enqueueRequest = function (req, opts) {
  _getPool(this, opts).enqueueRequest(req);
};

Agent.prototype._createConnection = net.createConnection;

var globalAgent = new Agent();

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
  if (opts.agent === false) opts.agent = this._getAgent('single');
  else if (!opts.agent) opts.agent = this._getAgent('global');
  opts.method = opts.method.toUpperCase();
  
  OutgoingMessage.call(this);
  this._mainline = [opts.method, opts.path, 'HTTP/1.1'].join(' ');
  this.setHeader('Host', [opts.host, opts.port].join(':'));
  this._addHeaders(opts.headers);
  if ('expect' in this._headers) this.flush();
  
  var self = this;
  this.once('_socket-SYNC', function (socket) {   // NOTE: sometimes called before _enqueueRequest returns
    if (self._aborted) return socket.emit('agentRemove');
    else self.abort = function () {
      socket.emit('agentRemove');
      socket.destroy();
    };
    
    // public event is always async
    setImmediate(function () {
      self.emit('socket', socket);
    });
    
    var response = new IncomingMessage('response', socket);
    response.once('_error', function (e) {
      self.emit('error', e);
    });
    if (opts.method === 'CONNECT') response._upgrade = true;      // parser can't detect (2xx vs. 101)
    response.once('_upgrade', function (head) {
      var event = (opts.method === 'CONNECT') ? 'connect' : 'upgrade',
          handled = self.emit(event, response, socket, head);
      if (!handled) socket.destroy();
      socket.emit('agentRemove');
    });
    response.on('_headersComplete', function () {
      if (response.statusCode === 100) {
        response._restartParser();
        self.emit('continue');
        return;
      }
      var handled = self.emit('response', response);
      if (!handled) response.resume();    // dump it
    });
    response.once('end', function () {
      var close = _closeRE.test(self._headers['connection']) || _closeRE.test(response.headers['connection']);
      if (close) {
        socket.emit('agentRemove');
        socket.end();
      } else socket.emit('_free');
    });
    self.on('error', self.abort);
  });
  opts.agent._enqueueRequest(this, opts);
}

util.inherits(ClientRequest, OutgoingMessage);

ClientRequest.prototype.abort = function () {     // NOTE: post-socket, replaced w/logic above
  this._aborted = true;
};

ClientRequest.prototype._getAgent = function (type) {
  return (type === 'global') ? globalAgent : new Agent();
};


/*
 * ServerResponse
 */

function ServerResponse() {
  OutgoingMessage.call(this);
  this.statusCode = 200;
  this.sendDate = true;
}

util.inherits(ServerResponse, OutgoingMessage);

ServerResponse.prototype.writeContinue = function () {
  this._outbox.write("HTTP/1.1 100 Continue\r\n\r\n");
};

ServerResponse.prototype.writeHead = function (code, reason, headers) {
  if (typeof reason !== 'string') {
    headers = reason;
    reason = (void 0);
  }
  this.statusCode = code;
  this.statusMessage = reason;
  if (headers) this._addHeaders(headers);
  this.flush();
};

ServerResponse.prototype.flush = function () {
  this._mainline = ['HTTP/1.1', this.statusCode, this.statusMessage || STATUS_CODES[this.statusCode] || ''].join(' ');
  OutgoingMessage.prototype.flush.apply(this, arguments);
};

/*
 * Server
 */

function Server() {
  net.Server.call(this);
  Server._commonSetup.call(this);
}

util.inherits(Server, net.Server);

Server._commonSetup = function () {       // also used by 'https'
  var self = this;
  function handleNextRequest(socket, prevRes) {
    var req = new IncomingMessage('request', socket),
        res = new ServerResponse();
    
    socket.on('close', _emitClose);
    res.once('finish', function () {
      socket.removeListener('close', _emitClose);
      if (res._keepAlive) {
        var handled = res.emit('_doneWithSocket');
        if (!handled) {
          // responded without consuming request
          req.resume();     // make sure it ends
          res = null;       // [see 'end' logic]
        }
      } else socket.end();
    });
    if (prevRes) prevRes.once('_doneWithSocket', function () {
      res._assignSocket(socket);
    });
    else res._assignSocket(socket);
    function _emitClose() {
      res.emit('close');
    }
    
    req.once('_error', function (e) {
      self.emit('clientError', e, socket);
    });
    req.once('_upgrade', function (head) {
      var event = (req.method === 'CONNECT') ? 'connect' : 'upgrade',
          handled = self.emit(event, req, socket, head);
      if (!handled) socket.destroy();
    });
    req.once('_headersComplete', function () {
      if (_closeRE.test(req.headers['connection'])) {
        res._keepAlive = false;
      }
      if (req.httpVersionMajor < 1 || (req.httpVersionMajor === 1 && req.httpVersionMinor < 1)) {
        res._keepAlive = false;
      }
      // WORKAROUND: https://github.com/tessel/runtime/issues/426
      //if (/\b100-continue\b/i.test(req.headers['expect'])) {
      if (/100-continue/i.test(req.headers['expect'])) {
        var handled = self.emit('checkContinue', req, res);
        if (handled) return;
        else res.writeContinue();
      }
      self.emit('request', req, res);
    });
    req.once('end', function () {
      if (!res || res._keepAlive) handleNextRequest(socket, res);
    });
  }
  this.on('connection', function (socket) {
    handleNextRequest(socket, null);
  });
  this.on('clientError', function (e, socket) {
    socket.destroy(e);
  });
};


/**
 * Public API
 */


exports.METHODS = METHODS;
exports.STATUS_CODES = STATUS_CODES;

exports.Server = Server;
exports.ServerResponse = ServerResponse;
exports.IncomingMessage = IncomingMessage;
exports.Agent = Agent;
exports.ClientRequest = ClientRequest;
exports.globalAgent = globalAgent;

exports.createServer = function (cb) {
  var server = new Server();
  if (cb) server.on('request', cb);
  return server;
};

exports.createClient = function () {
  throw Error("Deprecated and unimplemented. Use `http.request` instead.");
};

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
