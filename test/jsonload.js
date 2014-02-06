/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok(require('./jsonload-json').hello == 'hi', 'json imported');
ok(require('./jsonload-json.json').hello == 'hi', 'json imported explicitly');