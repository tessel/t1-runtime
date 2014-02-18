var a = 5;

function hello (okay) {
	console.log(okay);
};


hello.prototype.cool = function () {
	console.log('what')
};

hello('hello');
console.log(a + 5, [5, 6, 7], 0xFF & 0x4d)
console.log({hello: 'hi', a: 'ok'});