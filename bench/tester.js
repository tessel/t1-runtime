var nbody = require('./nbody');

var avg = [];

for (var i = 0; i < 20; i++) {
	var start = process.hrtime();
	nbody.run(1e5);
	var end = process.hrtime(start);
	avg.push(end);
}

var total = 0;
for (var i = 0; i < avg.length; i++) {
	total += avg[i][0] + (avg[i][1]/1e9);
}
total /= avg.length;

console.log(total);
