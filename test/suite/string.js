var tap = require('../tap');

tap.count(20);

tap.ok("1234567890".substring(3, 6) == "456", 'substring 1')
tap.ok("abc".substring(0, 0) == "", 'substring 2')
tap.ok("ababababab".indexOf('a') == 0, 'indexOf')
tap.ok("ababababab".lastIndexOf('a') == 8, 'lastIndexOf')
tap.ok("a,b,c,d,e".split(',').length == 5, 'split (string)')
console.log("#", "a,b,c,d,e".split(/,/));
tap.ok("a,b,c,d,e".split(/,/).length == 5, 'split (regexp)')
tap.ok("abc".slice(0,0) == "", 'slice 1')
tap.ok("abc".slice(0,1) == "a", 'slice 2')
tap.ok("abc"[0] == "a", 'index 1')
tap.ok("abc"['1'] == "b", 'index 2')

var s = "abc✨a✇def";
tap.eq(s.indexOf('d'), 6);
tap.eq(s.indexOf('def'), 6);
tap.eq(s.indexOf('defg'), -1);
tap.eq(s.indexOf('✨'), 3);
tap.eq(s.indexOf('a',-1), 0);
tap.eq(s.indexOf('a',4), 4);
tap.eq(s.indexOf('a',5), -1);
tap.eq(s.indexOf(''), 0);
tap.eq(s.indexOf('',2), 2);
//tap.eq(s.indexOf('',1 << 32), s.length);     // TODO: this is another can of worms!
tap.eq(s.indexOf('',1000), s.length);
