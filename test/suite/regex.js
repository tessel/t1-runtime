/* test rig */ var t = 1, tmax = 9
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok("garbage 09 _ - !@#$%".match(/^[\s\S]+$/), 'regex match');

ok("a".match(/^[\S]+$/), '\\S in class matches non-whitespace');
ok(!" ".match(/^[\S]+$/), '\\S in class does not match whitespace');

// socket.js
var a = /([^:]+)/;
var a = /([^:]+):([0-9]+)?/;
var a = /([^:]+):([0-9]+)?(\+)?:/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\d]*)/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
ok(true, 'regex compilation from connect socket.js');

// path.js
var a = /^(\/?|)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var a = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
ok(true,  'regex compilation from path.js')

// url.js
var a = /^[a-z]/i;
var a = /^[a-z]$/i;
var a = /^[a-z][a-z0-9]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;
ok(true, 'regex compilation from url.js')

// more matches
var subj1 = "there are 99 red balloons";
var subj2 = "here is a caveaaAEEAAEeaeaEAEaeeaEEAEEAet about regexes."
var subj3 = " ###    ##     ####  ";

var a = new RegExp("\\d+");
ok(subj1.match(a), '\\d matches numbers')

var b = /(\d+)(\s+)/;
ok(subj1.match(b), 'matches numbers and whitespace');

var c = /cav[ea]+t/i;
ok(subj2.match(c)[0] == 'caveaaAEEAAEeaeaEAEaeeaEEAEEAet', 'matches char classes');

ok(c.test(subj2), 'test() works')

console.log('#', subj3.replace(/\#+/, '___'));
console.log('#', subj3.replace(/\#+/g, '___'));
ok(subj3.replace(/\#+/, '___') == " ___    ##     ####  ", 'non-global replace')
ok(subj3.replace(/\#+/g, '___') == " ___    ___     ___  ", 'global replace')

ok(subj3.replace(/\#(\#*)/g, function (whole, p1, offset, str) {
  // console.log('-->', whole, p1, offset, str);
  return whole.length
}) == " 3    2     4  ", 'regex replace with fn');
