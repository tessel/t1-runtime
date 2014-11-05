var tap = require('../tap');

tap.count(1);

console.log(global);

tap.ok(true, 'can log entire global object.');
