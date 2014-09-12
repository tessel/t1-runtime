var tap = require('../tap');

tap.count(1);

var result = 0;

if (NaN) {
  // This should not be reached.
  result++;
}

tap.ok(!result, 'NaN should be a falsy value in if () {} block.');
