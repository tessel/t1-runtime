console.log('1..1')

try {
	throw new Error('ok 1')
} catch (e) {
	console.log(e.message);
}