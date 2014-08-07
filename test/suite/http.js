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
    
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      // WORKAROUND: https://github.com/tessel/runtime/issues/363
      if (typeof chunk !== 'string') chunk = chunk.toString();
      
      // NOTE: assumes single packet…
      var data = JSON.parse(chunk);
      t.equal(data.data, "HELLO WORLD");
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
