console.log('1..1');

var a = {
  test : function() { console.log('test');}
}

function B() {}

B.test = a.test;

for (var prop in B) {
  if (prop == 'test') {
  	console.log('ok');
  } else {
  	throw new Error('Unexpected key.');
  }
}
