var esprima = require('examples/esprima');
var io = require('io');

function readFileSync(file) {
    var f = io.open.call(file, "rb")
    var content = f.read("*all")
    f.close()
    return content
}

var r = new RegExp("hi", 'm');

var howmeta = esprima.parse(readFileSync('examples/colony.js'));
// var howmeta = esprima.parse('(function (err, a) {\n})();');

// console.log(howmeta);
console.log('done');