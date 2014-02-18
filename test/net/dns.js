var dns = require('dns');

console.log('1..2')

dns.resolve('graph.facebook.com', function (err, ip) {
	console.log(err ? 'nok' : 'ok', 1);
	console.log(ip == null || Array.isArray(ip) ? 'ok' : 'nok', 2);
	console.log('#', ip);
})