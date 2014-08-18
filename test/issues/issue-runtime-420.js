var tap = require('../tap');

tap.count(1);

tap.eq(process.umask(), parseInt('0022', 8));

