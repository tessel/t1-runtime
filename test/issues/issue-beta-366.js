var tap = require('../tap');

tap.count(3);

parseInt(null, 16)
console.log('#', parseInt(null, 16))
tap.ok(isNaN(parseInt(null, 10)));
tap.ok(isNaN(parseInt(null, 16)));
tap.eq(parseInt(null, 32), 785077);
