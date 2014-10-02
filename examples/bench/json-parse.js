var fs = require('fs');
var json2 = require('./json2');

var count = 5;
var data = fs.readFileSync(__dirname + '/json-parse-test.json', 'utf-8');
var minsize = 100000; // not including whitespace, unicode issues

var start1 = process.hrtime();
for (var i = 0; i < count; i++) {
	var attempt = JSON.parse(data);
	var out = JSON.stringify(attempt);
	if (out.length < minsize) {
		throw new Error('Invalid parsing by internal JSON parser');
	}
}
var end1 = process.hrtime();


var start2 = process.hrtime();
for (var i = 0; i < count; i++) {
	var attempt = json2.parse(data);
	var out = json2.stringify(attempt);
	if (out.length < minsize) {
		throw new Error('Invalid parsing by JSON.js');
	}
}
var end2 = process.hrtime();

var trial1 = (((end1[0]*1e9+end1[1]) - (start1[0]*1e9+start1[1])) / count)/1e9;
var trial2 = (((end2[0]*1e9+end2[1]) - (start2[0]*1e9+start2[1])) / count)/1e9;

console.log('Internal:\t', trial1.toFixed(3), 'seconds per iteration')
console.log('JSON.js:\t', trial2.toFixed(3), 'seconds per iteration')
