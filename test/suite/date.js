console.log(typeof Date.now() == 'number');
console.log('# typeof Date.now', typeof Date.now())
console.log(typeof Date() == 'string');
console.log(typeof (new Date) == 'object');

var d = new Date();
console.log(d.toString() == Date());
console.log('# toString', d.toString())
console.log(d.getDate() >= 1 && d.getDate() <= 31);
console.log('# getDate', d.getDate())
console.log(d.getDay() >= 0 && d.getDay() <= 6);
console.log('# getDay', d.getDay())
console.log(d.getFullYear() >= 1);
console.log('# getFullYear', d.getFullYear())
console.log(d.getHours() >= 0 && d.getHours() <= 23);
console.log('# getHours', d.getHours())
console.log(d.getMilliseconds() >= 0 && d.getMilliseconds() <= 999);
console.log('# getMilliseconds', d.getMilliseconds())
console.log(d.getMinutes() >= 0 && d.getMinutes() <= 59);
console.log('# getMinutes', d.getMinutes())
console.log(d.getMonth() >= 0 && d.getMonth() <= 11);
console.log('# getMonth', d.getMonth())
console.log(d.getSeconds() >= 0 && d.getSeconds() <= 59);
console.log('# getSeconds', d.getSeconds())
console.log(d.getTime() >= 0);
console.log('# getTime', d.getTime())
console.log(d.getYear() >= 0 && d.getYear() <= 200);
console.log('# getYear', d.getYear())

var d0 = new Date(0);
console.log(d0.toISOString() == '1970-01-01T00:00:00.000Z');
console.log('# toISOString', d0.toISOString());
console.log(d0.toJSON() == '1970-01-01T00:00:00.000Z');
console.log('# toJSON', d0.toJSON());