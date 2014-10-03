var fs = require('fs')

var count = 1000;
var data = fs.readFileSync(__dirname + '/../examples/bench/json-parse-test.json', 'utf-8');

var start = process.hrtime();
for (var i = 0; i < count; i++) {
	console.error(global);
	console.error(data);
}
var end = process.hrtime();

var s_start = (start[0] + (start[1]/1e9))
var s_end = (end[0] + (end[1]/1e9))
console.log('okay:', (s_end - s_start) / count, 'seconds per iteration')
