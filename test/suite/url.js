var expected = { protocol: 'ws:',
		 slashes: true,
		 auth: 'user:pass',
		 host: 'somedomain.com:1234',
		 port: '1234',
		 hostname: 'somedomain.com',
		 hash: '#hash1',
		 search: '?q=123',
		 query: 'q=123',
		 pathname: '/events',
		 path: '/events?q=123',
		 href: 'ws://user:pass@somedomain.com:1234/events?q=123#hash1' };


/* test rig */ var t = 1, tmax = Object.keys(expected).length + 2;
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
function equal (a, b, d) { console.log((a === b) ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }

console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var url = require('url');
ok(url.parse('http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6'), 'url parses');

var actual = url.parse('ws://user:pass@somedomain.com:1234/events?q=123#hash1');

Object.keys(expected).forEach(function(k){
  
  equal(actual[k], expected[k], k + ' should matched expected ')
});

