var tap = require('../tap')

tap.count(1)

var c = 0xedb88320 ^ 62317068;
console.log('#', c);
tap.ok(c < 0);

