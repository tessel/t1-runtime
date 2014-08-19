var tap = require('../tap');

tap.count(16);

tap.eq(typeof Date.now(), 'number');
console.log('# typeof Date.now', typeof Date.now())
tap.eq(typeof Date(),'string');
console.log(typeof (new Date) == 'object');

if (!(Date.now() > 0)) {
	throw new Error('Invalid Date.now()');
}

var d = new Date();
tap.eq(d.toString(), Date());
console.log('# toString', d.toString())
tap.ok(d.getDate() >= 1 && d.getDate() <= 31);
console.log('# getDate', d.getDate())
tap.ok(d.getDay() >= 0 && d.getDay() <= 6);
console.log('# getDay', d.getDay())
tap.ok(d.getFullYear() >= 1);
console.log('# getFullYear', d.getFullYear())
tap.ok(d.getHours() >= 0 && d.getHours() <= 23);
console.log('# getHours', d.getHours())
tap.ok(d.getMilliseconds() >= 0 && d.getMilliseconds() <= 999);
console.log('# getMilliseconds', d.getMilliseconds())
tap.ok(d.getMinutes() >= 0 && d.getMinutes() <= 59);
console.log('# getMinutes', d.getMinutes())
tap.ok(d.getMonth() >= 0 && d.getMonth() <= 11);
console.log('# getMonth', d.getMonth())
tap.ok(d.getSeconds() >= 0 && d.getSeconds() <= 59);
console.log('# getSeconds', d.getSeconds())
tap.ok(d.getTime() >= 0);
console.log('# getTime', d.getTime())
tap.ok(d.getYear() >= 0 && d.getYear() <= 200);
console.log('# getYear', d.getYear())

var d0 = new Date(0);
tap.eq(d0.toISOString(), '1970-01-01T00:00:00.000Z');
console.log('# toISOString', d0.toISOString());
tap.eq(d0.toJSON(), '1970-01-01T00:00:00.000Z');
console.log('# toJSON', d0.toJSON());

tap.eq(new Date("10/Mar/2012:05:00:07 +0000").valueOf(), 1331355607000);
