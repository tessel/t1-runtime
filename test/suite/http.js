var test = require('tinytap'),
    http = require('http'),
    net = require('net');

test('client-basic', function (t) {
  // test based loosely on http://nodejs.org/api/http.html#http_http_request_options_callback
  var req = http.request({
    hostname: 'httpbin.org',
    path: '/post',
    method: 'POST'
  }, function(res) {
    t.ok(res.statusCode, "has status");
    t.ok(res.headers, "has headers");
    t.equal(res.statusCode, 200, "got expected status");
    
    res.setEncoding('utf8');
    res.on('data', function (chunk) {      
      // NOTE: assumes single packet…
      var data = JSON.parse(chunk);
      t.equal(data.data, "HELLO WORLD");
      res.socket.destroy(); 
      t.end();
    });
  });
  
  req.on('response', function (res) {
    t.ok(res, "got response event");
  });
  req.on('error', function(e) {
    t.fail("unexpected request error");
  });
  
  req.setHeader('Content-Type', "text/plain");
  req.setHeader('Content-Length', 11);    // httpbin doesn't handle chunked…
  req.end("HELLO WORLD");
});

test('server-basic', function (t) {
  // based on http://nodejs.org/ homepage example
  
  var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }).listen(0, function () {
    test(this.address().port);
  });
  function test(port) {
    var req = http.get({port:port}, function(res) {
      t.equal(res.statusCode, 200, "got expected status");
      t.equal(res.headers['content-type'], 'text/plain', "got expected type");
      res.on('data', function (chunk) {
        // NOTE: assumes single packet…
        t.equal(chunk.length, 12);
        t.equal(chunk[0], "Hello World\n".charCodeAt(0));
        t.equal(chunk[11], "Hello World\n".charCodeAt(11));
      });
      res.on('end', function () {
        t.pass("request ended");
        server.close();
        req.end();
        t.end();
      });
    });
  }
});

test('client-errors', function (t) {
  var expect = 2;
  var req = http.get("http://example.invalid").on('error', function (e) {
    t.ok(e, "expected error");
    if (!--expect) t.end();
  });
  
  var server = net.createServer(function (socket) {
    socket.end([
      "HTTP/1.1 200 OK",
      "Transfer-Encoding: chunked",
      '',
      "garbage"
    ].join('\r\n'));
    this.close();
  }).listen(0, function () {
    http.get({port:this.address().port}).on('error', function (e) {
      t.ok(e, "expected error");
      req.end();
      try { server.close(); } catch (e) { /* swallow "Not running" error */ }
      if (!--expect) t.end();
    });
  });
});

test('server-errors', function (t) {
  var expect = 2;
  var server = http.createServer(function (req, res) {
    res.end();
    req.socket.end();
  }).on('clientError', function (e,s) {
    t.ok(e && s, "expected params");
    if (!--expect) {
      server.close();
      t.end();
    }
  }).listen(0, function () {
    test(this.address().port);
  });
  function test(port) {
    var client = net.connect(port, function () {
      client.end("garbage\n\n\n");      // TODO: why does it take server so long to receive this?!
    });
    http.request({port:port, method:'post', headers:{'Content-Length': 42}}).end();
  }
});

test('server-limit', function (t) {
  var server = http.createServer(function (req, res) {
    res.end();
    t.equal(Object.keys(req.headers).length, 1, "headers limited");
    server.close();
    t.end();
  }).listen(0, function () {
    this.maxHeadersCount = 1;
    var req = http.get({port:this.address().port, headers:{'x-a':1, 'x-b':2, 'x-c':3}}).end();
  })
});

test('client-auth', function (t) {
  var req = http.get({
      host: "httpbin.org",
      path: "/basic-auth/user/passwd",      // will 401 if not matched
      auth: "user:passwd"
    }, function (res) {
      t.equal(res.statusCode, 200);
      t.end();
    });
  req.end();
});

test('client-head', function (t) {
  http.request({
      method: 'HEAD',
      host: "ipcalf.com"
    }, function (res) {
      t.ok(res.headers['content-length']);
      res.on('data', function () {
        t.fail("should not get content");
      });
      res.on('end', function () {
        t.end();
      });
    }).end();
});

test('continue', function (t) {
  var server = http.createServer().on('checkContinue', function (req,res) {
    t.ok(req && res, "expected params");
    res.writeContinue();
    res.setHeader('X-Things', [1,2]);
    res.end();
  }).listen(0, function () {
    var req = http.request({port:this.address().port, headers: {expect:'100-continue'}}, function (res) {
      t.ok(res, "got response");
      t.equal(res.statusCode, 200, "correct status");
      t.equal(res.headers['x-things'], "1, 2", "proper headers");
      server.close();
      t.end();
    })
    req.on('continue', function () {
      t.pass("got continue");
      this.end();
    });
    req.end();
  });
});

test('connect', function (t) {
  // based on http://nodejs.org/dist/v0.11.13/docs/api/http.html#http_event_connect_1
  var serverSocket;
  var clientSocket;
  var proxy = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');
  });
  proxy.on('connect', function(req, cltSocket, head) {
    // connect to an origin server
    var srvUrl = require('url').parse('http://' + req.url);
    serverSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {
      clientSocket = cltSocket;
      clientSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                      'Proxy-agent: Node-Proxy\r\n' +
                      '\r\n');
      serverSocket.write(head);
      serverSocket.pipe(clientSocket);
      clientSocket.pipe(serverSocket);
    });
  });

  // now that proxy is running
  proxy.listen(0, function() {

    // make a request to a tunneling proxy
    var options = {
      port: this.address().port,
      method: 'CONNECT',
      path: 'ipcalf.com:80'
    };

    var req = http.request(options);
    req.end();

    req.on('connect', function(res, socket, head) {
      t.pass("got connected!");

      // make a request over an HTTP tunnel
      socket.write('GET / HTTP/1.1\r\n' +
                   'Host: ipcalf.com:80\r\n' +
                   'Accept: text/plain\r\n' +
                   'Connection: close\r\n' +
                   '\r\n');
      socket.on('data', function(chunk) {
        t.ok(net.isIP(chunk.toString().split('\n').pop()));
        proxy.close();
        socket.destroy();
        serverSocket.destroy();
        clientSocket.destroy();
        t.end();
      });
      socket.on('end', function() {
        proxy.close();
      });
    });
  });
});

test('upgrade', function (t) {
  // based on http://nodejs.org/dist/v0.11.13/docs/api/http.html#http_event_upgrade_1
  var srv = http.createServer(function (req, res) {
    console.log('got a request!');
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');
  });
  srv.on('upgrade', function(req, socket, head) {
    console.log("UPGRADED UP HERE");
    t.ok("got event");
    socket.write('HTTP/1.1 101 Web Socket Protocol Handshake\r\n' +
                 'Upgrade: WebSocket\r\n' +
                 'Connection: Upgrade\r\n' +
                 '\r\n');
  });

  // now that server is running
  srv.listen(1337, '127.0.0.1', function() {

    // make a request
    var options = {
      port: 1337,
      hostname: '127.0.0.1',
      headers: {
        'Connection': 'Upgrade',
        'Upgrade': 'websocket'
      }
    };
    
    var req = http.request(options);
    req.end();

    req.on('upgrade', function(res, socket, upgradeHead) {
      console.log('got upgraded!')
      t.ok("upgraded!");
      socket.end();
      t.end();
    });
  });
});

test('upgrade-head', function (t) {
  var server = http.createServer().on('upgrade', function (req, socket, head) {
    t.ok(req && socket, "expected params");
    t.equal(head.toString(), "extra");
    server.close();
    t.end();
  }).listen(0, function () {
    net.connect(this.address().port, function () {
      this.end(('GET / HTTP/1.1\r\n' +
                 'Upgrade: test\r\n' +
                 'Connection: upgrade\r\n' +
                 '\r\n'+
                 'extra'));
    });
  });
});

test('agent', function (t) {
  var server = http.createServer(function (req, res) {
    res.end('okay');
  }).listen(0, function () {
    test(this.address().port);
  });
  function test(port) {
    var agent = new http.Agent({keepAlive:false, maxSockets:2}),
        sockets = [];
    http.get({port:port, agent:agent}).on('socket', function (s) {
      sockets[0] = s;
      s.on('close', function () { sockets.CLOSED = true; });
    });
    http.get({port:port, agent:agent}).on('socket', function (s) {
      sockets[1] = s;
      s.on('close', function () { sockets.CLOSED = true; });
    });
    http.get({port:port, agent:agent}).on('socket', function (s) {
      if (sockets.CLOSED) t.pass("needed new socket");
      else t.ok(~sockets.indexOf(s), "reused a socket");
    }).on('response', function (res) {
      res.resume();
      res.on('end', function () {
        setTimeout(function () {
          http.get({port:port, agent:agent}).on('socket', function (s) {
            t.ok(!~sockets.indexOf(s), "got new socket");
            setTimeout(function () {
              server.close();
            }, 100);
            t.end();
          }).on('error', function (err) {
            throw new Error('failed agent test:\n', + err.stack); // contain stacktrace
          })
        }, 1e3);
      });
    });
  }
});

test('keepalive', function (t) {
  var server = http.createServer(function (req, res) {
    res.end('okay');
  }).listen(0, function () {
    keepalivetest(this.address().port);
  });
  function keepalivetest(port) {
    var agent = new http.Agent({keepAlive:true, maxSockets:1, maxFreeSockets:1}),
        socket = null;
    http.get({port:port, agent:agent}).on('socket', function (s) {
      socket = s;
    });
    http.get({port:port, agent:agent}).on('socket', function (s) {
      t.strictEqual(s, socket, "reused socket");
    }).on('response', function (res) {
      res.resume();
      res.on('end', function () {
        setTimeout(function () {
          http.get({port:port, agent:agent, headers:{connection:'close'}}).on('socket', function (s) {
            // TODO: this check fails on Node, which closes the socket
            // because it is uncontested during res.on('end')
            // t.strictUnequal(s, socket, "reused socket once more");
            http.get({port:port, agent:agent}).on('socket', function (s) {
              t.notStrictEqual(s, socket, "got new socket");
              server.close();
              t.end();
            });
          });
        }, 1e3);
      });
    });
  }
});

test('runtime issue #492', function (t) {
  http.createServer(function (req, res) {
    res.end();
    this.close();   // in lieu of unref
  }).listen(0, function () {
    http.get({port:this.address().port}, function (res) {
      res.on('end', function () {
        t.ok('good')
        t.end();
        // WORKAROUND: https://github.com/tessel/runtime/issues/336 perhaps? not relevant to this issue.
        // process.exit();
      }).resume();
    });
  })//.unref();
})
