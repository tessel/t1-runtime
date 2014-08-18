var tap = require('../tap');

tap.count(1);

var animal = { eats: true }
var rabbit = { jumps: true }

rabbit.__proto__ = animal  // inherit

tap.eq(rabbit.eats, true) // true

/*
// TODO
function fn () {
}

fn.__proto__ = {
	use: 'hello'
}

tap.eq(fn.use, 'hello');
*/
