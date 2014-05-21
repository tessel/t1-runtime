function randomBytes (n) {
	var buf = new Buffer(n);
	if (buf._random() != 0) {
		throw new Error('Entropy sources are drained.');
	}
	return buf;
}

exports.randomBytes = randomBytes;
exports.pseudoRandomBytes = pseudoRandomBytes; // todo real