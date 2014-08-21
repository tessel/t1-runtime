var test = require('tinytap'),
    http = require('http');

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
