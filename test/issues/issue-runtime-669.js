var tap = require('../tap');

tap.count(40);

var d = new Date();
var offset = d.getTimezoneOffset() * 60000;
var offsetMinutes = (offset / 60000 % 60);
var offsetHours = (offset / 3600000 % 24);

/** TIME **/

d = new Date();
d.setSeconds(40);
tap.eq(40, d.getSeconds());

d = new Date();
d.setMinutes(40);
tap.eq(40, d.getMinutes());

d = new Date();
d.setHours(8);
tap.eq(8, d.getHours());

d = new Date();
d.setSeconds(20);
d.setMinutes(40);
d.setHours(8);
tap.eq(40, d.getMinutes());
tap.eq(20, d.getSeconds());
tap.eq(8, d.getHours());

d = new Date();
d.setTime(35 + offset);
tap.eq(1970, d.getFullYear());
tap.eq(35, d.getMilliseconds());

/** DATE **/

d = new Date();
d.setDate(2);
tap.eq(2, d.getDate());

d = new Date();
d.setMonth(11);
tap.eq(11, d.getMonth());

d = new Date();
d.setYear(92);
tap.eq(92, d.getYear());
tap.eq(1992, d.getFullYear());

d = new Date();
d.setFullYear(1992);
tap.eq(92, d.getYear());
tap.eq(1992, d.getFullYear());

d = new Date();
d.setDate(2);
d.setMonth(11);
d.setFullYear(1992);
tap.eq(2, d.getDate());
tap.eq(11, d.getMonth());
tap.eq(92, d.getYear());
tap.eq(1992, d.getFullYear());

d = new Date();
d.setMinutes(36);
d.setMonth(4);
tap.eq(36, d.getMinutes());
tap.eq(4, d.getMonth());

/** NEW **/

d = new Date(1992, 11, 2, 16, 17, 18, 19);
tap.eq(1992, d.getFullYear());
tap.eq(92, d.getYear());
tap.eq(11, d.getMonth());
tap.eq(2, d.getDate());
tap.eq(16, d.getHours());
tap.eq(17, d.getMinutes());
tap.eq(18, d.getSeconds());
tap.eq(19, d.getMilliseconds());

/** FORMAT **/

function testEqIgnoreTimezoneName (a, b) {
  var re = / GMT[-+][0-9]{4} \([^)]+\)$/;
  tap.eq(a.replace(re, '...'), b.replace(re, '...'));
}

// 1992-12-02 UTC
d = new Date(723312000000);

tap.eq(d.toUTCString(), 'Wed, 02 Dec 1992 16:00:00 GMT');
tap.eq(d.toGMTString(), 'Wed, 02 Dec 1992 16:00:00 GMT');

// 1992-12-02 Local
d = new Date(1992, 11, 2, 16, 0, 0);

tap.eq(d.toDateString(), 'Wed Dec 02 1992');
testEqIgnoreTimezoneName(d.toTimeString(), '16:00:00 GMT+0000 (GMT)');

tap.eq(d.toLocaleDateString(), 'Wednesday, December 02, 1992');
tap.eq(d.toLocaleTimeString(), '16:00:00');
testEqIgnoreTimezoneName(d.toLocaleString(), 'Wed Dec 02 1992 16:00:00 GMT+0000 (GMT)');

/** UTC **/

d = new Date();
d.setHours(16);
d.setMinutes(0);
tap.eq(d.getUTCHours(), Math.floor(16 + offsetHours) % 24);

d = new Date();
d.setUTCHours(16);
d.setUTCMinutes(0);
tap.eq(d.getHours(), Math.floor(16 - offsetHours) % 24);

d = new Date();
d.setMinutes(35);
tap.eq(d.getUTCMinutes(), (35 + offsetMinutes) % 60);

d = new Date();
d.setUTCMinutes(35);
tap.eq(d.getMinutes(), (35 - offsetMinutes) % 60);

tap.eq(Date.UTC(1992, 11, 2, 16, 17), 723313020000);
