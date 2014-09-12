var tap = require('../tap');

tap.count(8);

var testString = "This is a Test String";
var buffer = new Buffer(testString);
tap.eq(buffer.toString(), testString, "default encoding doesn't return utf-8 encoded string.");
tap.eq(buffer.toString('utf8'), testString, "utf-8 encoding doesn't return the correct string.");
tap.eq(buffer.toString('utf8', 5, 7), testString.slice(5, 7), "Offset arguments not returning correct string");
tap.eq(buffer.toString('utf8', -5, -5), '', "Negative offset arguments return empty string");
tap.eq(buffer.toString('utf8', -5, 5), testString.slice(0, 5), "Negative start offset defaults to start offset of 0");
tap.eq(buffer.toString('utf8', 0, 1000), testString, "End offset larger then buffer defaults to end of buffer");
tap.eq(buffer.toString('utf8', 5, 1000), testString.slice(5), "End offset larger then buffer defaults to end of buffer while origin offset still slices");

var fakeEncoding = 'fake';
try {
  buffer.toString('fake');
}
catch(e) {
  tap.eq(e.name, "TypeError", "Error thrown on invalid encoding.");
}
