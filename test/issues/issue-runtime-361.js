var tap = require('../tap');

tap.count(1);

function B() {}

B.prototype.foo = function(callback) {
  callback();
}

B.prototype.bar = function() {
  tap.ok(false, '"this" isnt a shadowed variable');
}

var b = new B();

b.foo(function() {
  // `this` should not equal `b`
  try {
  	this.bar();
  } catch (e) {
  	tap.ok(true, '"this" isnt a shadowed variable');
  }
})
