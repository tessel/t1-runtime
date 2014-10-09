/* test rig */ var t = 1, tmax = 16
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

tap.count(35);

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
tap.eq(decodeURI("https://developer.mozilla.org/ru/docs/JavaScript_%D1%88%D0%B5%D0%BB%D0%BB%D1%8B"), "https://developer.mozilla.org/ru/docs/JavaScript_шеллы", "decodeURI works properly")
var url = "http:// the original_ . example.com"
tap.eq(url, decodeURI(encodeURI(url)), "URI round trips");
tap.eq(decodeURI(a), a.toString(), "Decoding an object returns the string representation of the object");
var b = 1;
tap.eq(decodeURI(b), b.toString(), "Decoding an number just returns the string representation of the number");

// unicode uri encode/decode/escape
var raw = "\0AϨ👀\0";
var enc = "%00A%CF%A8%F0%9F%91%80%00";
var esc = "%00A%u03E8%uD83D%uDC40%00";
tap.eq(encodeURI(raw), enc, 'encodeURI');
tap.eq(decodeURI(enc), raw, 'decodeURI');
tap.eq(encodeURIComponent(raw), enc, 'encodeURIComponent');
tap.eq(decodeURIComponent(enc), raw, 'decodeURIComponent');
tap.eq(escape(raw), esc, 'escape');
tap.eq(unescape(esc), raw, 'unescape');


tap.eq(String.fromCharCode(0x1A), '\u001A')
tap.eq(String.fromCharCode(0x1A), '\x1A');
tap.eq(String.fromCharCode(0x2603).length, 1);
tap.eq(String.fromCharCode(0x2603), '☃');
tap.eq(String.fromCharCode(0x2603), '\u2603');
tap.ok(String.fromCharCode(0x2603) != '\x26\x03');

var poo = '💩';
tap.eq(poo.length, 2);
tap.eq("\ud83d", poo[0]);
tap.eq("\udca9", poo[1]);
tap.eq(0xd83d, poo.charCodeAt(0), poo.charCodeAt(0));
tap.eq(0xdca9, poo.charCodeAt(1), poo.charCodeAt(1));
tap.eq(poo, '\ud83d\udca9');
tap.ok(poo != '\xd8\x3d\xdc\xa9');

tap.eq(String.fromCharCode(0x2603), String.fromCharCode(0x12603), 'fromCharCode truncates UCS-2 values');
tap.eq(poo.length, 2, 'length is reported as ucs-2, 2 == ' + poo.length);
