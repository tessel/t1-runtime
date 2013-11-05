var acorn = require('./acorn')
var fs = require('fs')

acorn.parse(fs.readFileSync(__dirname + '/acorn.js'));