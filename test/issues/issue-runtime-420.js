var tap = require('../tap');

tap.count(1);

tap.eq(typeof process.umask(), 'number');

