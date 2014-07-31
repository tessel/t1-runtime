var test = require('tinytap');
var StringDecoder = require('string_decoder').StringDecoder;

test.count(2);

test('can decode utf8', function(t) {

  var decoder = new StringDecoder('utf8');

  var cent = new Buffer([0xC2, 0xA2]);
  t.equal(typeof "String", typeof decoder.write(cent), 'Decoder does not return a string.');
  t.equal('¢', decoder.write(cent));
  t.end();
});