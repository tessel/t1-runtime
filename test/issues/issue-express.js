function fn () {
}

// mixin Router class functions
fn.__proto__ = {
	use: 'hello'
}

console.log(fn.use);