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


/**
 * IncomingMessage
 */
 
function IncomingMessage (type, connection) {
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
      self.emit('_headersComplete');
    }),
    onBody: js_wrap_function(function (body) {
      self.push(body);
    }),
    onMessageComplete: js_wrap_function(function () {
      self.push(null);
    })
  });
  this.connection.on('error', function (e) {
    self.emit('_error', e);
  });
  this.connection.on('data', function (data) {
    var msg = parser.execute(data.toString('binary'), 0, data.length);
    if (msg) self.emit('_error', new Error(msg));   // NOTE: '_error' becomes ClientRequest 'error' or Server 'clientError'
  });
  this.connection.on('end', function () {
    var msg = parser.finish();
    if (msg) self.emit('_error', new Error(msg));
    else self.push(null);
  });
  this._restartParser = function () {
    parser.reinitialize(type);
  };
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

function OutgoingMessage () {
  Writable.call(this);
  
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
  this._outbox.pipe(socket);
  this.emit('socket', socket);
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
  //if (1) lines.push('Connection: close');     // HACK: currently, we don't support keep-alive
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

Agent.prototype._createConnection = function (opts, cb) {
  return net.createConnection(opts, cb);
};

Agent.prototype._enqueueRequest = function (req, opts) {
  var host = this._getHost(opts);
  var socket = this._createConnection(opts, function () {
    req._assignSocket(socket);
  });
  return {
    host: host,
    release: function () { socket.end(); }
  };
  
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
  
  OutgoingMessage.call(this);
  this._agent = opts.agent._enqueueRequest(this, opts);
  this._mainline = [opts.method, opts.path, 'HTTP/1.1'].join(' ');
  this.setHeader('Host', this._agent.host);
  this._addHeaders(opts.headers);
  
  var self = this;
  this.once('socket', function (socket) {
    var response = new IncomingMessage('response', socket);
    response.once('_error', function (e) {
      self.emit('error', e);
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
      self._agent.release();
    });
  });
}

util.inherits(ClientRequest, OutgoingMessage);

ClientRequest.prototype.abort = function () {
  // TODO: implement
};

ClientRequest.prototype._getAgent = function () {
  return globalAgent;
};


/*
 * ServerResponse
 */

function ServerResponse(socket) {
  OutgoingMessage.call(this);
  this._outbox = socket;
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
  this.on('connection', function (socket) {
    var req = new IncomingMessage('request', socket),
        res = new ServerResponse(socket);
    req.once('_error', function (e) {
      self.emit('clientError', e, socket);
    });
    req.once('_headersComplete', function () {
      if (/100-continue/i.test(req.headers['expect'])) {
        var handled = self.emit('checkContinue', req, res);
        if (handled) return;
        else res.writeContinue();
      }
      self.emit('request', req, res);
    });
    res.once('finish', function () {
      socket.end();
    });
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
