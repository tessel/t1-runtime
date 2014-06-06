console.log('1..2')

var https = require('https');

https.get("https://shiga-5072.herokussl.com/", function (res) {
  console.log('ok')
  console.log('# statusCode', res.statusCode)
  res.on('data', function (data) {
  	// console.log('# received', data.length, 'bytes');
  })
  res.on('end', function () {
  	console.log('ok - done');
  })
}).on('error', function (e) {
  console.log('not ok -', e.message, 'error event #SKIP')
});
