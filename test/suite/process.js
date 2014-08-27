var tap = require('../tap');

tap.count(1);

tap.eq(typeof process.version, 'string', 'process version exists as a string');