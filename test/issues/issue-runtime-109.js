/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + String(a) + ' == ' + String(b)); }

tap(2);

eq(JSON.stringify('a,b,c,d'.split(/,/)), JSON.stringify(['a', 'b', 'c', 'd']), 'split(/,/)');
eq(JSON.stringify('a\r\nb\r\nc\r\nd'.split(/[\r\n]+/)), JSON.stringify(['a', 'b', 'c', 'd']), 'split(/[\\r\\n]+/)');
