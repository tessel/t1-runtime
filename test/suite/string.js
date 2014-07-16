/* test rig */ var t = 1, tmax = 7
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok("1234567890".substring(3, 6) == "456", 'substring 1')
ok("abc".substring(0, 0) == "", 'substring 2')
ok("ababababab".indexOf('a') == 0, 'indexOf')
ok("ababababab".lastIndexOf('a') == 8, 'lastIndexOf')
ok("a,b,c,d,e".split(',').length == 5, 'split (string)')
console.log("#", "a,b,c,d,e".split(/,/));
ok("a,b,c,d,e".split(/,/).length == 5, 'split (regexp)')
ok("abc".slice(0,0) == "", 'slice 1')
ok("abc".slice(0,1) == "a", 'slice 2')
