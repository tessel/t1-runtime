var tap = require('../tap');

tap.count(1);

var http = require('http');

http.get("http://tessel-httpbin.herokuapp.com/", function (res) {
  tap.ok(typeof res.statusCode, 'number');
  res.on('data', function (data) {
    console.log('# received', data.length, 'bytes');
  })
}).on('error', function (e) {
  tap.ok(false, String(e));
});
