var tap = require('../tap')

tap.count(1)

var str = "x".replace(/x/, function () {
  return true;
});
tap.eq(str, 'true');
