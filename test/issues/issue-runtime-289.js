var tap = require('../tap');

tap.count(18);

// Built-in constructors called with new create boxed primitives
tap.eq(typeof new Number(500), 'object', 'built-in Number constructor creates boxed primitives with truthy value.');
tap.eq(typeof new Number(0), 'object', 'built-in Number constructor creates boxed primitives with false value.');
tap.eq(typeof new String("foo"), 'object', 'built-in String constructor creates boxed primitives with truthy value.');
tap.eq(typeof new String(""), 'object', 'built-in String constructor creates boxed primitives with false value.');
tap.eq(typeof new Boolean(true), 'object', 'built-in Boolean constructor creates boxed primitives with truthy value.');
tap.eq(typeof new Boolean(false), 'object', 'built-in Boolean constructor creates boxed primitives with false value.');

// The result of calling valueOf on a boxed primitive is a primitive
tap.eq(typeof new Number(500).valueOf(), 'number', 'The result of valueOf with truthy value on a boxed Number primitive is a Number.');
tap.eq(typeof new Boolean(0), 'object', 'The result of valueOf with falsy value on a boxed Number primitive is a Number.');
tap.eq(typeof new String("foo").valueOf(), 'string', 'The result of valueOf with truthy value on a boxed String primitive is a String.');
tap.eq(typeof new String("").valueOf(), 'string', 'The result of valueOf with falsy value on a boxed String primitive is a String.');
tap.eq(typeof new Boolean(true).valueOf(), 'boolean', 'The result of valueOf with truthy value on a boxed Boolean primitive is a Boolean.');
tap.eq(typeof new Boolean(false).valueOf(), 'boolean', 'The result of valueOf with falsy value on a boxed Boolean primitive is a Boolean.');

// Built-in constructors called as functions return primitives
tap.eq(typeof Number(500), 'number', 'Built-in Number constructor called as a function with truthy value returns a primitive Number.');
tap.eq(typeof Number(0), 'number', 'Built-in Number constructor called as a function with falsy value returns a primitive Number.');
tap.eq(typeof String("foo"), 'string', 'Built-in String constructor called as a function with truthy value returns a primitive String.');
tap.eq(typeof String(""), 'string', 'Built-in String constructor called as a function with falsy value returns a primitive String.');
tap.eq(typeof Boolean(true), 'boolean', 'Built-in Boolean constructor called as a function with truthy value returns a primitive Boolean.');
tap.eq(typeof Boolean(false), 'boolean', 'Built-in Boolean constructor called as a function with falsy value returns a primitive Boolean.');
