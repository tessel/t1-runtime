var animal = { eats: true }
var rabbit = { jumps: true }

rabbit.__proto__ = animal  // inherit

console.log(rabbit.eats) // true