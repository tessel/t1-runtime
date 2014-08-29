var tap = require('../tap');

tap.count(1);

require('tls')
tap.ok(true);
