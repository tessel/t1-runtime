console.log('1..3')

var a = new Date();
console.log(new Date() - new Date() == 0 ? 'ok' : 'not ok')

var a = new Date()
var b = new Date()
console.log(a - b == 0 ? 'ok' : 'not ok')

var a = new Date();
var a_val = Number(a);
var b = {
	valueOf: function () {
		return a_val - 1000;
	}
}
console.log(a - b == 1000 ? 'ok' : 'not ok')
