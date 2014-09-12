var tap = require('../tap');

tap.count(1);

process.nextTick(function () {
	tap.ok(true);
});
