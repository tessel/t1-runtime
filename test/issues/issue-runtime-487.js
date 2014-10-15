var tap = require('../tap');

tap.count(1);

var Test = function Test() {
  this.alpha = "hi";
  this.bravo = 1;
  this.charlie = ["hello", "there"]
  this.delta = function() {};
};

Test.prototype.echo = function echo() {};

var t = new Test(),
    opts = [];

for (var opt in t) { opts.push(opt); }

tap.ok(opts.indexOf('echo') > -1, 'function iterator carries enumerable properties from prototype');
