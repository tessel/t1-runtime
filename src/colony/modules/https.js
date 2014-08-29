// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.


var util = require('util');
var http = require('http');
var tls = require('tls');

/**
 * Server
 */
 
function Server() {
  tls.Server.call(this);
  http.Server._commonSetup.call(this);
}

util.inherits(Server, tls.Server);

/**
 * Agent
 */

function Agent() {
  http.Agent.call(this);
}

util.inherits(Agent, http.Agent);

Agent.prototype._createConnection = tls.connect;

var globalAgent = new Agent();

/**
 * ClientRequest
 */

function ClientRequest(opts) {
  opts = util._extend(opts, { port: 443 });
  http.ClientRequest.call(this, opts);
}

util.inherits(ClientRequest, http.ClientRequest);

ClientRequest.prototype._getAgent = function (type) {
  return (type === 'global') ? globalAgent : new Agent();
};


/**
 * Public API
 */

exports.Server = Server;
exports.Agent = Agent;
exports.ClientRequest = ClientRequest;
exports.globalAgent = globalAgent;

exports.createServer = function (cb) {
  var server = new Server();
  if (cb) server.on('request', cb);
  return server;
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
