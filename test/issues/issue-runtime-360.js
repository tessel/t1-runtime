console.log('1..6');

var a = [1,2,3];

Object.keys(a).forEach(function (key) {
	console.log(typeof key == 'string' ? 'ok' : 'not ok - Object.keys returns non-string', key, typeof key);
})

for (var key in a) {
	console.log(typeof key == 'string' ? 'ok' : 'not ok - Object.keys returns non-string', key, typeof key);	
}
