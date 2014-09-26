var tap = require('../tap');

tap.count(14);

tap.eq(String.fromCharCode(0x1A), '\u001A');
tap.eq(String.fromCharCode(0x1A), '\x1A');

// console.log(String.fromCharCode(0x2603) == '☃');
// console.log(String.fromCharCode(0x2603) == '\u2603');
// console.log(String.fromCharCode(0x2603) != '\x26\x03');

// encodeURI
tap.eq(encodeURI('www. spaces .com'), 'www.%20spaces%20.com', "Encode URI didn't provide");
var reservedChars = ';,/?:@&=+$'
tap.eq(reservedChars, encodeURI(reservedChars), "encodeURI does not encode reserved characters");
var unescapedChars = "-_.!~*'()";
tap.eq(unescapedChars, encodeURI(unescapedChars, "encodeURI does not encode unescaped characters"))
var score = '#';
tap.eq(score, encodeURI(score), 'encodeURI does not encode score character');
var a = {};
tap.eq(encodeURI(a), '%5Bobject%20Object%5D', "encoding an object encoded the string representation");

// escape
tap.eq(escape('abc123'), 'abc123', 'Escaping non-encoded characters');
tap.eq(escape('@*_+-./'), '@*_+-./', 'Escaping non-encoded special characters');
tap.eq(escape('!@#hello$%^'), '%21@%23hello%24%25%5E', 'Escaping non-special characters');


// decodeURI
tap.eq(decodeURI("https://developer.mozilla.org/ru/docs/JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B"), "https://developer.mozilla.org/ru/docs/JavaScript_шеллы", "Decoding is not working properly")
var url = "http:// the original_ . example.com"
tap.eq(url, decodeURI(encodeURI(url)), "Decoding an Encoded URI returns the original string");
tap.eq(decodeURI(a), a.toString(), "Decoding an object returns the string representation of the object");
var b = 1;
tap.eq(decodeURI(b), b.toString(), "Decoding an number just returns the string representation of the number");