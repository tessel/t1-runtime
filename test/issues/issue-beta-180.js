var tap = require('../tap');

tap.count(1);

var b = 0;
function a () {
	return b = 5; 
}

console.log((b = {a: 5}).a);

// var test = [function () { console.log(ok); }]
// test[a]();

var i = { length : 1 };
var task = [function () { tap.eq(this, task); }]
task[i.length - 1]();