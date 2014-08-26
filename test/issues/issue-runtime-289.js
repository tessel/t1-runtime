var tap = require('../tap');

tap.count(9);

// Built-in constructors called with new create boxed primitives
tap.eq(typeof new Number(0), 'object', 'built-in Number constructor creates boxed primitives.');
tap.eq(typeof new String(""), 'object', 'built-in String constructor creates boxed primitives.');
tap.eq(typeof new Boolean(false), 'object', 'built-in Boolean constructor creates boxed primitives.');

// The result of calling valueOf on a boxed primitive is a primitive
tap.eq(typeof new Number(0).valueOf(), 'number', 'The result of valueOf on a boxed Number primitive is a Number');
tap.eq(typeof new String("").valueOf(), 'string', 'The result of valueOf on a boxed String primitive is a String');
tap.eq(typeof new Boolean(false).valueOf(), 'boolean', 'The result of valueOf on a boxed Boolean primitive is a Boolean');


// Built-in constructors called as functions return primitives
tap.eq(typeof Number(0), 'number', 'Built-in Number constructor called as a function return primitive Number');
tap.eq(typeof String(""), 'string', 'Built-in String constructor called as a function return primitive String');
tap.eq(typeof Boolean(false), 'boolean', 'Built-in Boolean constructor called as a function return primitive Boolean');
