var tap = require('../tap');

tap.count(2);

var http = require('http');

http.get("http://tessel-httpbin.herokuapp.com/get?id=5327684&units=imperial", function(res) {
  console.log('#', res.statusCode)
  tap.eq(res.statusCode, 200, 'status code');
  var json = '';
  res.on('data', function (chunk) {
  	json = json + chunk;
  });
  res.on('end', function () {
  	tap.eq(JSON.parse(json).args.units, 'imperial', 'get query arguments passed properly')
  })
}).on('error', function (e) {
  tap.ok(false, String(e));
});
