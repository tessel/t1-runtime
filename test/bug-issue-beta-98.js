/* test rig */ var t = 1, tmax = 4
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var arr = [];
ok(arr.length == 0, 'array [] len 0')
arr.hello = 'hi';
ok(arr.length == 0, 'array keys constant')

arr.push(1, 2, 3, 4, 5);
ok(arr[0] == 1, 'array key set');