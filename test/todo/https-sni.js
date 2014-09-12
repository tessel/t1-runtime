console.log('1..2')

var https = require('https');

// Temporary tessel catchall
https.get("https://sni.velox.ch/", function (res) {
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
