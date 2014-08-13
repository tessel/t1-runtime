function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
tap.count = tap;
tap.ok = function (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
tap.eq = function (a, b, c) { tap.ok(a == b, String(c) + ': ' + JSON.stringify(String(a)) + ' == ' + JSON.stringify(String(b))); }
module.exports = tap;
