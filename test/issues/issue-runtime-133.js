var Readable = require('stream').Readable;
var rs = new Readable;
rs._read = function () { }
rs.pipe(process.stdout);
rs.push('1..1\n')
rs.push('ok\n');
