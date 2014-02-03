console.log(typeof Date.now() == 'number');
console.log(typeof Date() == 'string');
console.log(typeof (new Date) == 'object');

var d = new Date();
console.log(d.toString() == Date());
console.log('#', d.toString())
console.log(d.getDate() >= 1 && d.getDate() <= 31);
console.log('#', d.getDate())
console.log(d.getDay() >= 0 && d.getDay() <= 6);
console.log('#', d.getDay())
console.log(d.getFullYear() >= 1);
console.log('#', d.getFullYear())
console.log(d.getHours() >= 0 && d.getHours() <= 23);
console.log('#', d.getHours())
console.log(d.getMilliseconds() >= 0 && d.getMilliseconds() <= 999);
console.log('#', d.getMilliseconds())
console.log(d.getMinutes() >= 0 && d.getMinutes() <= 59);
console.log('#', d.getMinutes())
console.log(d.getMonth() >= 0 && d.getMonth() <= 11);
console.log('#', d.getMonth())
console.log(d.getSeconds() >= 0 && d.getSeconds() <= 59);
console.log('#', d.getSeconds())
console.log(d.getTime() >= 0);
console.log('#', d.getTime())
console.log(d.getYear() >= 0 && d.getYear() <= 200);
console.log('#', d.getYear())