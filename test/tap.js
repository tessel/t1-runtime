/*
** Simple tap tester.
** This should rely on as few features as possible.
** modules, console.log, fns, string concat, String cast, JSON.stringify, if statements.
*/

var tap = exports;
tap.count = function (max) { tap.t = 1; console.log(String(tap.t) + '..' + String(max)); };
tap.ok = function (a, d) { var not = ''; if (!a) { not = 'not '; } console.log(not + 'ok', tap.t, '-', d); tap.t = tap.t + 1; }
tap.eq = function (a, b, c) { tap.ok(a == b, String(c) + ': ' + JSON.stringify(String(a)) + ' == ' + JSON.stringify(String(b))); }
