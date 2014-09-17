var tap = require('../tap');

tap.count(10);

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
