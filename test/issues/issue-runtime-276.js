/* test rig */ var t = 1, tmax = 1;
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);

try {
  require("MISSING");
} catch (e) {
    var msg = e.toString();
    ok(msg.match(/find module .MISSING/), "no unexpected path in module resolution error");
}