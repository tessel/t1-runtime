// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/* test rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

/* script */

tap(2);

console.log('#', 0 && true)
ok(!(0 && true), '0 should short-circuit truthiness');

var a = 0;
console.log('#', a && true)
ok(!(a && true), '0 var should short-circuit truthiness');

console.log('#', 0 || 42)
ok((0 || 42) == 42, '0 should short-circuit falsiness');

var a = 0;
console.log('#', a || 42)
ok((a || 42) == 42, '0 var should short-circuit falsiness');