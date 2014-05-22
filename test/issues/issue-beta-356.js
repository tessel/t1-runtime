console.log('1..1');

process.nextTick(function () {
	console.log('ok');
});
