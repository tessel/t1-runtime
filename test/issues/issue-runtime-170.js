console.log('1..2');
var dash = require(__dirname + '/170/runtime-170/test-subfolder/subfolder');
console.log(dash == true ? 'ok' : 'not ok');
var underscore = require(__dirname + '/170/runtime_170/test-subfolder/subfolder');
console.log(underscore == true ? 'ok' : 'not ok');
