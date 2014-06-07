console.log('1..2')

var https = require('https');
var dns = require('dns');

// Temporary tessel catchall
dns.resolve('sni.velox.ch', function (err, addresses) {
	https.get("https://" + addresses[0] + "/", function (res) {
	  console.log('ok')
	  console.log('# statusCode', res.statusCode)

	  var buf = '';
	  res.on('data', function (data) {
	  	console.log('# received', data.length, 'bytes');
	  	buf += String(data);
	  })
	  res.on('close', function () {
	  	console.log('# result:', buf);
	  	console.log('ok');
	  })
	}).on('error', function (e) {
	  console.log('not ok -', e.message, 'error event #SKIP')
	});
});