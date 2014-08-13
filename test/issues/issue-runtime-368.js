console.log('1..2');

var obj = [ ];
function test (k) {
	console.log(typeof k == 'string' ? 'ok' : 'not ok', typeof k)
	var b = obj[k]
	console.log(typeof k == 'string' ? 'ok' : 'not ok', typeof k)
}
test('5')
