var tap = require('../tap');

tap.count(1);

var obj = {};
console.log("# obj.__proto__ =", obj.__proto__);
console.log("# Object.getPrototypeOf(obj) =", Object.getPrototypeOf(obj));
tap.eq(obj.__proto__, Object.getPrototypeOf(obj), 'same prototype');
