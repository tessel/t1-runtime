var tap = require('../tap');

tap.count(30);

// Built-in constructors called with new create boxed primitives
tap.eq(typeof new Number(500), 'object', 'built-in Number constructor creates boxed primitives with truthy value.');
tap.eq(typeof new Number(0), 'object', 'built-in Number constructor creates boxed primitives with falsy value.');
tap.eq(typeof new String("foo"), 'object', 'built-in String constructor creates boxed primitives with truthy value.');
tap.eq(typeof new String(""), 'object', 'built-in String constructor creates boxed primitives with falsy value.');
tap.eq(typeof new Boolean(true), 'object', 'built-in Boolean constructor creates boxed primitives with truthy value.');
tap.eq(typeof new Boolean(false), 'object', 'built-in Boolean constructor creates boxed primitives with falsy value.');

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

// Calling the object function with a primitive returns an object
tap.eq(typeof (Object(500)), 'object', 'calling the Object function with a truthy Number returns an object');
tap.eq(typeof (Object(0)), 'object', 'calling the Object function with a falsy Number returns an object');
tap.eq(typeof (Object("foo")), 'object', 'calling the Object function with a truthy String returns an object');
tap.eq(typeof (Object("foo")), 'object', 'calling the Object function with a falsy String returns an object');
tap.eq(typeof (Object()), 'object', 'calling the Object function with a truthy String returns an object');
tap.eq(typeof (Object()), 'object', 'calling the Object function with a falsy String returns an object');
tap.eq(Object(500) == Object(500), false, 'returned value from Object function is unique');

// Calling valueOf of an object should return the object
var a = {foo : 'bar'};
tap.eq(a, a.valueOf(), 'valueOf of an object is the object');


// Calling Object function with Date returns the Dates
var b = new Date();
tap.eq(b, Object(b), 'Objectification of a Date is the Date itself');

var c = 'foo';
var cObj = Object(c);
tap.eq(Array.isArray(Object.keys(cObj)), true, 'Objectification of a String converts it to an array of characters');
tap.eq(Object.keys(cObj).length, c.length, 'Objectification of a String converts it to an array of characters');
tap.eq(cObj.length, c.length, 'Returned array is the same length as the string');
