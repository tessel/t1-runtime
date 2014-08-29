var tap = require('../tap')

tap.count(1)

var Readable = require('stream').Readable;
var rs = new Readable;
rs._read = function () { }
rs.pipe(process.stdout);

tap.ok(true);
