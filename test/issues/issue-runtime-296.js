var tap = require('../tap');

tap.count(3)

var d = new Date(42);
tap.eq(d.valueOf(), 42, 'valueOf');
tap.eq(d.toISOString(), '1970-01-01T00:00:00.042Z', 'toISOString');

tap.eq(new Date("1970-01-01T00:00:00.042Z").valueOf(), 42, 'valueOf new date');
