/* test rig */ var t = 1, tmax = 4
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var s = '10';
ok(parseInt(s,10) == 10);
ok(parseFloat(s,10) == 10);
console.log("# base 10:", parseInt(s,10));
ok(parseInt(s,16) == 16);
ok(parseFloat(s,16) == 10);
console.log("# base 16:", parseInt(s,16));
ok(parseInt(s,2) == 2);
ok(parseFloat(s,2) == 10);
console.log("# base  2:", parseInt(s,2));

ok(parseInt('0399') == 399, 'octal int');
ok(parseFloat('0399') == 399, 'octal float');

// stress test invalid radixes
ok(parseInt(s,0) == 10, 'radix 0');
ok(isNaN(parseInt(s,37)));
ok(isNaN(parseInt(s,1)));
ok(isNaN(parseInt(s,"1")));
ok(!isNaN(parseFloat(s,0)));