/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var url = require('url');
ok(url.parse('http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6'), 'url parses');