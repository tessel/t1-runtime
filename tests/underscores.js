var a_b = 'hi';

console.log(1, a_b);

a_b += ' there';

console.log(2, a_b);

console.log(3, a_b.toUpperCase());

var c_d = {};

c_d.cool_beans = 5;

console.log(4, c_d['cool_beans']);

c_d.func_tastic = function () {
  console.log(5, 'OK');
}

c_d.func_tastic();

var end = 'this is the end'

console.log(6, end);