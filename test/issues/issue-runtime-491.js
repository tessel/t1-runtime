var tap = require('../tap')

tap.count(2);

var paramRegExp = /; *([!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) *= *("(?:[ !\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u0020-\u007e])*"|[!#$%&'\*\+\-\.0-9A-Z\^_`a-z\|~]+) */g;
var string = 'string text/html; charset=utf-8';

tap.eq(paramRegExp.exec(string).join('|'), '; charset=utf-8|charset|utf-8', 'exec works');
tap.eq(paramRegExp.exec(string), null, 'exec preserves lastindex');
