console.log('1..4');

console.log('ok');
try {
	console.log('ok');
	throw new Error('ok');
} catch (e) {
	console.log(e.message)
	console.log('#')
}
console.log('ok');