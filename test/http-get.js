console.log('1..1')

var http = require('http');

http.get("http://www.google.com/index.html", function (res) {
  console.log('ok')
  console.log('# statusCode', res.statusCode)
}).on('error', function (e) {
  console.log('not ok -', e.message)
});