var tap = require('../tap');

tap.count(1);

var http = require('http');

// Temporary tessel catchall

// This is a hardcoded IP for google.com.
http.request({
	hostname: '64.233.167.99',
	port: 80,
	path: '/index.html',
	method: 'GET'
}, function (res) {
  tap.eq(typeof res.statusCode, 'number');
  console.log('# statusCode', res.statusCode)
  res.on('data', function (data) {
  	console.log('# received', data.length, 'bytes');
  })
}).on('error', function (e) {
  tap.ok(false, String(e));
});
