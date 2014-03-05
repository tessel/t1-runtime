console.log('1..1')
try {
	throw Error("Test");
	console.log('not ok')
} catch (e) {
	console.log('ok')
}