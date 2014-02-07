var dns = require('dns');

console.log('1..2')

dns.resolve('graph.facebook.com', function (err, ip) {
	console.log(err ? 'nok' : 'ok');
	console.log(typeof ip == 'string' ? 'ok' : 'nok');
	console.log('#', ip);
})