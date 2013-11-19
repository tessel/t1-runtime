var acorn = require('./acorn')
var fs = require('fs')

var start = process.hrtime();
acorn.parse(fs.readFileSync(__dirname + '/acorn.js'));
var end = process.hrtime(start);
console.log(end);