var punycode = require('punycode');

process.debug = true

// encode domain name parts
punycode.encode('mañana'); // 'maana-pta'
punycode.encode('☃-⌘'); // '--dqo34k'

// decode domain names
punycode.toUnicode('xn--maana-pta.com'); // 'mañana.com'
punycode.toUnicode('xn----dqo34k.com'); // '☃-⌘.com'

// encode domain names
punycode.toASCII('mañana.com'); // 'xn--maana-pta.com'
punycode.toASCII('☃-⌘.com'); // 'xn----dqo34k.com'

punycode.ucs2.decode('abc'); // [97, 98, 99]
// surrogate pair for U+1D306 tetragram for centre:
punycode.ucs2.decode('\uD834\uDF06'); // [0x1D306]

punycode.ucs2.encode([97, 98, 99]); // 'abc'
punycode.ucs2.encode([0x1D306]); // '\uD834\uDF06'

var regexSeparators = /\x2E|\u3002|\uFF0E|\uFF61/g;
