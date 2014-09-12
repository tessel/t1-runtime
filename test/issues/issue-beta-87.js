var tap = require('../tap');

tap.count(1);

console.log(true << 1);
console.log(+true << 1);

tap.ok(true);
