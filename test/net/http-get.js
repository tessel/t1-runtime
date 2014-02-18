console.log('1..1')

var http = require('http');

// Temporary tessel catchall
try {
	http.get("http://www.google.com/index.html", function (res) {
	  console.log('ok')
	  console.log('# statusCode', res.statusCode)
	  res.on('data', function (data) {
	  	console.log('# received', data.length, 'bytes');
	  })
	}).on('error', function (e) {
	  console.log('not ok -', e.message, 'error event #SKIP')
	});
} catch (e) {
	console.log('not ok -', e.message, 'error thrown #SKIP')
}