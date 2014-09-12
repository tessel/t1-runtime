var tap = require('../tap');

tap.count(3);

var simpleQueue = new Array();

simpleQueue.pushItem = function(item) {
  this.push(item);
  tap.ok(this.length == 2, "Length should be 2: " + this.length);
};

console.log('well', simpleQueue.length)
simpleQueue.push(1);
tap.ok(simpleQueue.length == 1);

simpleQueue.pushItem('foo');

var b = new Array();
b[0] = 5;
b[1] = 5;
b.push(1);
tap.ok(b.length == 3);
