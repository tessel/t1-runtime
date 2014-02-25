var a = [1, 2, 3];

console.log('1..1')
a.forEach(function (b) {
	if (b == null) {
		console.log('not ok');
		process.exit(1);
	}
})
console.log('ok')