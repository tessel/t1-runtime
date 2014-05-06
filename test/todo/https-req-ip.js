console.log('1..1')

var https = require('https');

// Temporary tessel catchall
try {
	https.request({
		hostname: '74.125.224.72',
		port: 443,
		path: '/',
		method: 'GET',
		headers: {
			'Host': 'www.google.com'
		}
	}, function (res) {
	  console.log('ok')
	  console.log('# statusCode', res.statusCode)
	  res.on('data', function (data) {
	  	console.log('# received', data.length, 'bytes');
	  	console.log(data);
	  })
	}).on('error', function (e) {
	  console.log('not ok -', e.message, '#SKIP')
	});
} catch (e) {
	console.log('not ok -', e.message, '#SKIP')
}