console.log('1..5');

var a = {};

Object.defineProperty(a, 'hello', {
	value: 'hi'
})

console.log(a.hello == 'hi' ? 'ok' : 'not ok');

try {
	Object.defineProperty(null, 'hello', {
		value: 'hi'
	})
	console.log('not ok');
} catch (e) {
	console.log('ok');
}

try {
	Object.defineProperty('', 'hello', {
		value: 'hi'
	})
	console.log('not ok');
} catch (e) {
	console.log('ok', '#', e);
}

try {
	Object.defineProperty(0, 'hello', {
		value: 'hi'
	})
	console.log('not ok');
} catch (e) {
	console.log('ok');
}

try {
	Object.defineProperty(true, 'hello', {
		value: 'hi'
	})
	console.log('not ok');
} catch (e) {
	console.log('ok');
}
