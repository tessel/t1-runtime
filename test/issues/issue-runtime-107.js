/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + JSON.stringify(a) + ' == ' + JSON.stringify(b)); }

tap(2);

eq('Hello World'.replace(/\s|l*/g, ''), 'HeoWord', '/\s|l*/ replace');
eq('Hello World'.replace(/l*/g, '_'), '_H_e__o_ _W_o_r__d_', '/l*/ replace');
