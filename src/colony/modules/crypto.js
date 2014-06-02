// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var tm = process.binding('tm');

function randomBytes (n) {
	var buf = new Buffer(n);
	if (buf._random() != 0) {
		throw new Error('Entropy sources are drained.');
	}
	return buf;
}

function Hmac (encryption, key)
{
	if (encryption != 'sha1') {
		throw new Error('HMAC encryption ' + String(encryption) + ' not supported.');
	}

	this.encryption = encryption;
	this.key = key;
	this._values = [];
}

Hmac.prototype.update = function (buf) {
	this._values.push(Buffer.isBuffer(buf) ? buf : new Buffer(buf));
	return this;
}

Hmac.prototype.digest = function (encoding) {
	var msg = Buffer.concat(this._values);
	var hash = tm.hmac_sha1(this.key, msg);
	if (!hash) { // disabled
		return null;
	}
	return encoding ? hash.toString(encoding) : hash;
}

function createHmac (encryption, key)
{
	return new Hmac(encryption, key);
}

exports.randomBytes = randomBytes;
exports.pseudoRandomBytes = randomBytes; // todo real
exports.createHmac = createHmac;
