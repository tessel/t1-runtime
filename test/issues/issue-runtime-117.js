/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + String(a) + ' == ' + String(b)); }

tap(1);

eq('   text / x-lua  lua  !'.replace(/^\s*/g, ''), 'text / x-lua  lua  !', '/^\s*/ replaces only at BOL');
