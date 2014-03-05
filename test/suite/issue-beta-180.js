var b = 0;
function a () {
	return b = 5; 
}

console.log((b = {a: 5}).a);

// var test = [function () { console.log(ok); }]
// test[a]();

var i = { length : 1 };
var task = [function () { console.log(this == task ? 'ok' : 'not ok'); }]
task[i.length - 1]();