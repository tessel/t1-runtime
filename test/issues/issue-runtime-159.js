var tap = require('../tap')

tap.count(1)

var mAccelLast;
var delta = 20 - mAccelLast; // Tessel would hang here!

tap.ok(true);
