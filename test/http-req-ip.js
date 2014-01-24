console.log('1..1')

var http = require('http');

http.request({
	hostname: '74.125.224.72',
	port: 80,
	path: '/index.html',
	method: 'GET'
}, function (res) {
  console.log('ok')
  console.log('# statusCode', res.statusCode)
}).on('error', function (e) {
  console.log('not ok -', e.message)
});