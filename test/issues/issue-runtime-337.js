var tap = require('../tap');

tap.count(1);

var a = {
  test : function() { console.log('test');}
}

function B() {}

B.test = a.test;

for (var prop in B) {
  if (prop == 'test') {
  	tap.ok(true, 'only function object prop should be "test"')
  } else {
  	throw new Error('Unexpected key.');
  }
}
