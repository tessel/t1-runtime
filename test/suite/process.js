var tap = require('../tap');

tap.count(7);

tap.eq(typeof process.version, 'string', 'process version exists as a string');

var start = process.hrtime();
setTimeout(function () {
	var diff = process.hrtime(start);

	tap.ok(Array.isArray(start), 'hrtime returns an array')
	tap.eq(start.length, 2, 'hrtime returns a type of numbers')
	tap.eq(typeof start[0], 'number', 'hrtime returns an array')
	tap.eq(typeof start[1], 'number', 'hrtime returns an array')

	tap.ok(Array.isArray(diff), 'hr can take an argument and return a diff');
	tap.ok(diff[0] == start[0] ? diff[0] <= start : diff[0] < start[0], 'hrtime diff is lower than start')
}, 100);
