var tap = require('../tap');

tap.count(1);

var arr = [];

for (var i in arr) {
  console.log('#', i);
  tap.ok(false, 'Array should not have found index');
  process.exit(1);
}
tap.ok(true);
