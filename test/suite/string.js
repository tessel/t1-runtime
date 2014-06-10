/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok("1234567890".substring(3, 6) == "456", 'substring')
ok("ababababab".indexOf('a') == 0, 'indexOf')
ok("ababababab".lastIndexOf('a') == 8, 'lastIndexOf')
ok("a,b,c,d,e".split(',').length == 5, 'split (string)')
ok("a,b,c,d,e".split(/,/).length == 5, 'split (regexp)')
