var dns = require('dns');

console.log('1..2')

dns.resolve('graph.facebook.com', function (err, ip) {
	console.log(!err ? 'ok' : 'not ok', 1);
	console.log(ip == null || Array.isArray(ip) ? 'ok' : 'not ok', 2);
	console.log('#', ip);
})