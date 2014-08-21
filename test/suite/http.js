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
    
    //res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // WORKAROUND: https://github.com/tessel/runtime/issues/363
      if (typeof chunk !== 'string') chunk = chunk.toString();
      
      // NOTE: assumes single packet…
      var data = JSON.parse(chunk);
      t.equal(data.data, "HELLO WORLD");
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
  
  http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
  }).listen(0, function () {
    test(this.address().port);
  });
  function test(port) {
    http.get({port:port}, function(res) {
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
        t.end();
      });
    });
  }
});

test('client-errors', function (t) {
return t.end();   // TODO: file/fix DNS exception
  var expect = 2;
  http.get("http://example.invalid").on('error', function (e) {
    t.ok(e, "expected error");
    if (!--expect) t.end();
  });
  
  net.createServer(function (socket) {
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
      if (!--expect) t.end();
    });
  });
});

test('server-errors', function (t) {
return t.end();  // TODO: troubleshoot hang
  var expect = 2;
  http.createServer(function (req, res) {
    res.end();
  }).on('clientError', function (e,s) {
    t.ok(e && s, "expected params");
    if (!--expect) t.end();
  }).listen(0, function () {
    test(this.address().port);
  });
  function test(port) {
    net.connect(port, function () {
      this.write("garbage\n\n\n");
    });
    http.request({port:port, method:'post', headers:{'Content-Length': 42}}).end();
  }
});

test('continue', function (t) {
return t.end();  // TODO: troubleshoot hang
  var expect = 3;
  http.createServer(function (req, res) {
    res.setHeader('X-Things', [1,2]);
    res.end("DATA");
  }).on('checkContinue', function (req,res) {
    t.ok(req && res, "expected params");
    if (!--expect) t.end();
    res.writeContinue();
  }).listen(0, function () {
    http.request({port:this.address().port, headers: {expect:'100-continue'}}, function (res) {
      t.ok(res, "got response");
      if (!--expect) t.end();
    }).on('continue', function () {
      t.pass("got continue");
      if (!--expect) t.end();
      this.end();
    });
  });
});

test('connect', function (t) {
  // based on http://nodejs.org/dist/v0.11.13/docs/api/http.html#http_event_connect_1
  var proxy = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');
  });
  proxy.on('connect', function(req, cltSocket, head) {
    // connect to an origin server
    var srvUrl = require('url').parse('http://' + req.url);
    var srvSocket = net.connect(srvUrl.port, srvUrl.hostname, function() {
      cltSocket.write('HTTP/1.1 200 Connection Established\r\n' +
                      'Proxy-agent: Node-Proxy\r\n' +
                      '\r\n');
      srvSocket.write(head);
      srvSocket.pipe(cltSocket);
      cltSocket.pipe(srvSocket);
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
        t.end();
      });
//      socket.on('end', function() {
//        proxy.close();
//        t.end();
//      });
    });
  });

});

test('upgrade', function (t) {
  var expect = 2;
  // based on http://nodejs.org/dist/v0.11.13/docs/api/http.html#http_event_upgrade_1
  var srv = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('okay');
  });
  srv.on('upgrade', function(req, socket, head) {
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
      t.ok("upgraded!");
      socket.end();
      t.end();
    });
  });
});

test('upgrade-head', function (t) {
return t.end();  // TODO: troubleshoot hang
  http.createServer().on('upgrade', function (req, socket, head) {
    t.ok(req && socket, "expected params");
    t.equal(head.toString(), "extra");
    t.end();
  }).listen(0, function () {
    net.connect(this.address().port, function () {
      this.end(('GET / HTTP/1.1' +
                 'Upgrade: test\r\n' +
                 'Connection: upgrade\r\n' +
                 '\r\n'+
                 'extra'));
    });
  });
});
