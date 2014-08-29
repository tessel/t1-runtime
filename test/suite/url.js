var tap = require('../tap');

tap.count(14);

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

tap.ok(process.versions.colony, 'running in colony')

var url = require('url');
tap.ok(url.parse('http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6'), 'url parses');

var actual = url.parse('ws://user:pass@somedomain.com:1234/events?q=123#hash1');

Object.keys(expected).forEach(function(k){
  tap.eq(actual[k], expected[k], k + ' should matched expected ')
});

tap.ok(url.parse('http://api.openweathermap.org/data/2.5/weather?id=5327684&units=imperial').hostname == 'api.openweathermap.org', 'hostname match');
