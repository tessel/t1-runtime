/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')



function Test(testMessage) {
    this.test = testMessage;
}

function printit(err, obj) {
    ok(err == null, 'No error');
    ok(obj.test == 'Success', 'String passed');
}

var t = new Test("Success");

printit.bind(null, null, t)();