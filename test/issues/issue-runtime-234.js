var tap = require('../tap');

tap.count(4);

var parent = {};
var child = {testFunc : function() { console.log('test')}};
tap.eq(typeof child, 'object', 'child before property added');
tap.eq(typeof child.testFunc, 'function', 'testFunc before property added');
parent[child] = 'foo';
tap.eq(typeof child, 'object', 'child after property added');
tap.eq(typeof child.testFunc, 'function', 'testFunc after property added');
