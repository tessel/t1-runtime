console.log('1..1');

var arr = [{a:1}, {a:6},{a:2}, {a:4}]
arr.sort(function(a, b) {
	console.log(a, b);
	return a.a - b.a
})

arr.sort();

console.log('ok');
