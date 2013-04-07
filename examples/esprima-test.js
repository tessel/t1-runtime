var esprima = require('examples/esprima');

var table = esprima.parse('console.log("hi");', { tokens: true });

console.log(table);