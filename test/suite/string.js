var tap = require('../tap');

tap.count(58);

tap.ok("1234567890".substring(3, 6) == "456", 'substring 1')
tap.ok("abc".substring(0, 0) == "", 'substring 2')
tap.ok("ababababab".indexOf('a') == 0, 'indexOf')
tap.ok("ababababab".lastIndexOf('a') == 8, 'lastIndexOf')
tap.ok("a,b,c,d,e".split(',').length == 5, 'split (string)')
tap.ok("a,b,c,d,e".split(/,/).length == 5, 'split (regexp)')
tap.ok("abc".slice(0,0) == "", 'slice 1')
tap.ok("abc".slice(0,1) == "a", 'slice 2')
tap.ok("abc"[0] == "a", 'index 1')
tap.ok("abc"['1'] == "b", 'index 2')

var s = "abc👀a✇def";
tap.eq(s.indexOf('d'), 7);
tap.eq(s.indexOf('def'), 7);
tap.eq(s.indexOf('defg'), -1);
tap.eq(s.indexOf('👀'), 3);
tap.eq(s.indexOf('a',-1), 0);
tap.eq(s.indexOf('a',5), 5);
tap.eq(s.indexOf('a',6), -1);
tap.eq(s.indexOf(''), 0);
tap.eq(s.indexOf('',2), 2);
tap.eq(s.indexOf('',Infinity), s.length);
tap.eq(s.indexOf('',1000), s.length);
tap.eq(s.lastIndexOf('a'), 5);
tap.eq(s.lastIndexOf('a', 4), 0);
tap.eq(s.lastIndexOf('a', -1), 0);
tap.eq(s.lastIndexOf('👀'), 3);
tap.eq(s.lastIndexOf('f'), s.length-1);
tap.eq(s.lastIndexOf('f',s.length-2), -1);
tap.eq(s.lastIndexOf(''), s.length);

tap.eq(s.slice(0,1), "a");
tap.eq(s.slice(1,3), "bc");
tap.eq(s.slice(-1), "f");
tap.eq(s.slice(-1,-1), "");
tap.eq(s.slice(3,5), "👀");

tap.eq(s.slice(3,4), s[3]);
tap.eq(s.slice(4,5), s[4]);
tap.eq(s.slice(3,4).charCodeAt(0), 0xD83D);
tap.eq(s.slice(4,5).charCodeAt(0), 0xDC40);

tap.eq(s.substring(0,1), "a");
tap.eq(s.substring(1,3), "bc");
tap.eq(s.substring(-1), s);
tap.eq(s.substring(-1,-1), "");
tap.eq(s.substring(1,-3), "a");
tap.eq(s.substring(-3,1), "a");
tap.eq(s.substring(3,5), "👀");
tap.eq(s.substring(5,3), "👀");

tap.eq(s.substr(0,1), "a");
tap.eq(s.substr(1,2), "bc");
tap.eq(s.substr(-1), "f");
tap.eq(s.substr(-1,-1), "");
tap.eq(s.substr(3,2), "👀");

tap.eq(String.fromCharCode(0x00, 0x40, 1000, 0xd83d, 0xdc40, 0x10000), "\0@Ϩ👀\0");

tap.eq(s[3], '\ud83d');
tap.eq(s[4], '\udc40');
tap.eq(s[5], 'a');
tap.eq(s[6], '✇');
tap.eq(s.charAt(6), '✇');
tap.eq(s[s.length], undefined);
tap.eq(s.charAt(s.length), '');
