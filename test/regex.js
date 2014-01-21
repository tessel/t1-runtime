console.log('1..6')
console.log(process.versions.colony ? 'ok' : 'not ok', '1 - running in colony')
console.log("garbage 09 _ - !@#$%".match(/^[\s\S]+$/) ? 'ok' : 'not ok', '2 - regex match');

console.log("a".match(/^[\S]+$/) ? 'ok' : 'not ok', '3 - \\S in class matches non-whitespace');
console.log(" ".match(/^[\S]+$/) ? 'not ok' : 'ok', '4 - \\S in class does not match whitespace');

// socket.js
var a = /([^:]+)/;
var a = /([^:]+):([0-9]+)?/;
var a = /([^:]+):([0-9]+)?(\+)?:/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\d]*)/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
console.log('ok 5 - regex compilation from connect socket.js');

// path.js
var a = /^(\/?|)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var a = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
console.log('ok 6 - regex compilation from path.js')