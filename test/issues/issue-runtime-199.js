/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + JSON.stringify(String(a)) + ' == ' + JSON.stringify(String(b))); }

tap(1);

eq([0, 1].join(','), '0,1', '[0,1].join() does not omit 0');
