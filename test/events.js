process.on('data', function (d) {
	console.log('data=>', d);
});

process.on('message', function (d) {
	console.log('message=>', d);
});

process.emit('data', 'ok')

console.log(require('events'));