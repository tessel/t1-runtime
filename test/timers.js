/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

setTimeout(function () {
  ok(this == global, '"this" value in timer is global object');
  ok(true, 'console.log of global works #TODO');
  // console.log(this)
}, 10);

var id = setInterval(function () {
  ok(false, 'error in test');
  console.log('# error, interval was not cancelled')
  process.exit(1);
}, 100)
clearInterval(id);

console.log('# timeout id:', id)