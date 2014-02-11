/* test rig */ var t = 1, tmax = 3
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok(!(0) == true, '0 is falsy');
ok(!(false) == true, 'false is falsy');
ok(!(undefined) == true, 'undefined is falsy')
ok(!(nil) == true, 'nil is falsy')
ok(!('') == true, '"" is falsy');
ok(!!([]) == true, '[] is truthy');
ok(!!("0") == true, '\"0\" is truthy');
ok(!!({}) == true, '{} is truthy');

var a;
a = 0; ok(!(a) == true, '0 is falsy');
a = false; ok(!(a) == true, 'false is falsy');
a = undefined; ok(!(a) == true, 'undefined is falsy')
a = nil; ok(!(a) == true, 'nil is falsy')
a = ''; ok(!(a) == true, '"" is falsy');
a = []; ok(!!(a) == true, '[] is truthy');
a = "0"; ok(!!(a) == true, '\"0\" is truthy');
a = {}; ok(!!(a) == true, '{} is truthy');