var tap = require('../tap')

tap.count(2)

var dash = require(__dirname + '/170/runtime-170/test-subfolder/subfolder');
tap.eq(dash, true);
var underscore = require(__dirname + '/170/runtime_170/test-subfolder/subfolder');
tap.eq(underscore, true);
