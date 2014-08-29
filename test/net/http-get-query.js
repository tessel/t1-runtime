var tap = require('../tap');

tap.count(1);

var http = require('http');

http.get("http://api.openweathermap.org/data/2.5/weather?id=5327684&units=imperial", function(res) {
  console.log('#', res.statusCode)
  tap.eq(res.statusCode, 200, 'status code');
  res.on('data', function (chunk) {
    console.log('#BODY: ' + chunk);
  });
}).on('error', function (e) {
  tap.ok(false, String(e));
});
