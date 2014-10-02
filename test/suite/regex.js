var tap = require('../tap');

tap.count(23);

tap.ok("garbage 09 _ - !@#$%".match(/^[\s\S]+$/), 'regex match');

tap.ok("a".match(/^[\S]+$/), '\\S in class matches non-whitespace');
tap.ok(!" ".match(/^[\S]+$/), '\\S in class does not match whitespace');

// socket.js
var a = /([^:]+)/;
var a = /([^:]+):([0-9]+)?/;
var a = /([^:]+):([0-9]+)?(\+)?:/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\d]*)/;
var a = /([^:]+):([0-9]+)?(\+)?:([^:]+)?:?([\s\S]*)?/;
tap.ok(true, 'regex compilation from connect socket.js');

// path.js
var a = /^(\/?|)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var a = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
tap.ok(true,  'regex compilation from path.js');

// url.js
var a = /^[a-z]/i;
var a = /^[a-z]$/i;
var a = /^[a-z][a-z0-9]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;
var a = /^[a-z][a-z0-9\-+]*$/i;
tap.ok(true, 'regex compilation from url.js');

// more matches
var subj1 = "there are 99 red balloons";
var subj2 = "here is a caveaaAEEAAEeaeaEAEaeeaEEAEEAet about regexes."
var subj3 = " ###    ##     ####  ";

var a = new RegExp("\\d+");
tap.ok(subj1.match(a), '\\d matches numbers');

var b = /(\d+)(\s+)/;
tap.ok(subj1.match(b), 'matches numbers and whitespace');

var c = /cav[ea]+t/i;
tap.ok(subj2.match(c)[0] == 'caveaaAEEAAEeaeaEAEaeeaEEAEEAet', 'matches char classes');

tap.ok(subj1.match('99'), 'matches non-regex values');
tap.ok(a.exec(subj1).index == 10, 'exec with index attribute');
tap.ok(a.exec(subj1).input == subj1, 'exec with input attribute');
tap.ok(b.exec(subj1).index == 10, 'exec with index attribute and submatch');

tap.ok(c.test(subj2), 'test() works');

var d = /re/gi;

tap.ok(d.lastIndex == 0, 'check for .lastIndex');
d.exec(subj1);
tap.ok(d.lastIndex == 5, 'check for .lastIndex after .exec()');
d.exec(subj1);
tap.ok(d.lastIndex == 9, 'check for .lastIndex after second .exec()');
d.exec(subj1);
tap.ok(d.lastIndex == 15, 'check for .lastIndex after third .exec()');
d.exec(subj1);
tap.ok(d.lastIndex == 0, 'check for .lastIndex after fourth .exec()');
d.exec(subj1);
tap.ok(d.lastIndex == 5, 'check for .lastIndex after null match in .exec()');

console.log('#', subj3.replace(/\#+/, '___'));
console.log('#', subj3.replace(/\#+/g, '___'));
tap.ok(subj3.replace(/\#+/, '___') == " ___    ##     ####  ", 'non-global replace');
tap.ok(subj3.replace(/\#+/g, '___') == " ___    ___     ___  ", 'global replace');

tap.ok(subj3.replace(/\#(\#*)/g, function (whole, p1, offset, str) {
  // console.log('-->', whole, p1, offset, str);
  return whole.length;
}) == " 3    2     4  ", 'regex replace with fn');
