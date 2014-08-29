var tap = require('../tap');

tap.count(1);

console.log('#', new Buffer([0x35]) + '67');
tap.eq(new Buffer([0x35]) + '67', '\x3567');
