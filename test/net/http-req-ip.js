console.log('1..1')

var http = require('http');

// Temporary tessel catchall

// This is a hardcoded IP for google.com.
try {
	http.request({
		hostname: '64.233.167.99',
		port: 80,
		path: '/index.html',
		method: 'GET'
	}, function (res) {
	  console.log('ok')
	  console.log('# statusCode', res.statusCode)
	  res.on('data', function (data) {
	  	console.log('# received', data.length, 'bytes');
	  })
	}).on('error', function (e) {
	  console.log('not ok -', e.message, '#SKIP')
	});
} catch (e) {
	console.log('not ok -', e.message, '#SKIP')
}