try {
	setImmediate(function () {
		throw new Error('THIS IS AN ERROR');
	})
} catch (e) {
	console.log('error', e);
}