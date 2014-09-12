var tap = require('../tap');

tap.count(2);

tap.eq(Date.parse("1970-01-01T00:00:00.042Z"), 42, 'Date.parse');
tap.eq(new Date("1970-01-01T00:00:00.042Z").valueOf(), 42, 'new Date().valueOf');
