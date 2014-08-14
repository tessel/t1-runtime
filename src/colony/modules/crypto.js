// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var tm = process.binding('tm');

function checkAvailable () {
	if (!tm.TLS_ENABLED) {
		throw new Error('Crypto module not enabled in this build of Tessel firmware.');
	}
}

var util = require('util');
var Duplex = require('stream').Duplex;

function randomBytes (n) {
	var buf = new Buffer(n);
	if (buf._random() != 0) {
		throw new Error('Entropy sources are drained.');
	}
	return buf;
}

function Hmac (encryption, key)
{
	checkAvailable();

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
	return encoding ? hash.toString(encoding) : hash;
}

function createHmac (encryption, key)
{
	checkAvailable();

	return new Hmac(encryption, key);
}

/**
 * Hashes
 */

var hashes = {
	'sha1': [ tm.hash_sha1_create, tm.hash_sha1_update, tm.hash_sha1_digest ],
	'sha1withrsaencryption': [ tm.hash_sha1_create, tm.hash_sha1_update, tm.hash_sha1_digest ],
	'rsa-sha1': [ tm.hash_sha1_create, tm.hash_sha1_update, tm.hash_sha1_digest ],
	'rsa-sha1-2': [ tm.hash_sha1_create, tm.hash_sha1_update, tm.hash_sha1_digest ],
	'ssl3-sha1': [ tm.hash_sha1_create, tm.hash_sha1_update, tm.hash_sha1_digest ],

	'sha224': [ tm.hash_sha224_create, tm.hash_sha224_update, tm.hash_sha224_digest ],
	'sha224withrsaencryption': [ tm.hash_sha224_create, tm.hash_sha224_update, tm.hash_sha224_digest ],
	'rsa-sha224': [ tm.hash_sha224_create, tm.hash_sha224_update, tm.hash_sha224_digest ],

	'sha256': [ tm.hash_sha256_create, tm.hash_sha256_update, tm.hash_sha256_digest ],
	'sha256withrsaencryption': [ tm.hash_sha256_create, tm.hash_sha256_update, tm.hash_sha256_digest ],
	'rsa-sha256': [ tm.hash_sha256_create, tm.hash_sha256_update, tm.hash_sha256_digest ],

	'sha384': [ tm.hash_sha384_create, tm.hash_sha384_update, tm.hash_sha384_digest ],
	'sha384withrsaencryption': [ tm.hash_sha384_create, tm.hash_sha384_update, tm.hash_sha384_digest ],
	'rsa-sha384': [ tm.hash_sha384_create, tm.hash_sha384_update, tm.hash_sha384_digest ],

	'sha512': [ tm.hash_sha512_create, tm.hash_sha512_update, tm.hash_sha512_digest ],
	'sha512withrsaencryption': [ tm.hash_sha512_create, tm.hash_sha512_update, tm.hash_sha512_digest ],
	'rsa-sha512': [ tm.hash_sha512_create, tm.hash_sha512_update, tm.hash_sha512_digest ],

	'md5': [ tm.hash_md5_create, tm.hash_md5_update, tm.hash_md5_digest ],
	'md5withrsaencryption': [ tm.hash_md5_create, tm.hash_md5_update, tm.hash_md5_digest ],
	'rsa-md5': [ tm.hash_md5_create, tm.hash_md5_update, tm.hash_md5_digest ],
	'ssl2-md5': [ tm.hash_md5_create, tm.hash_md5_update, tm.hash_md5_digest ],
	'ssl3-md5': [ tm.hash_md5_create, tm.hash_md5_update, tm.hash_md5_digest ],
};

function getHashes ()
{
	return Object.keys(hashes);
}

function Hash (algorithm)
{
	Duplex.call(this);
	this.algorithm = String(algorithm).toLowerCase();

	if (!(this.algorithm in hashes)) {
		throw new Error('Hash algorithm ' + String(algorithm) + ' not supported.');
	}

	this._ctx = hashes[this.algorithm][0]();
}

util.inherits(Hash, Duplex);

Hash.prototype.update = function (buf) {
	hashes[this.algorithm][1](this._ctx, buf);
	return this;
}

Hash.prototype._write = function (chunk, encoding, callback) {
	this.update(chunk);
	if (callback) {
		callback();
	}
}

Hash.prototype._read = function (size) {
	// noop
}

Hash.prototype.end = function (chunk, encoding, callback) {
	if (chunk) {
		this._write.call(this, chunk, encoding, callback);
	}
	this.push(this.digest());
	// this.push(null);
	// Duplex.prototype.end.call(this);
}

Hash.prototype.digest = function (encoding) {
	var hash = hashes[this.algorithm][2](this._ctx);
	return encoding ? hash.toString(encoding) : hash;
}

function createHash (algorithm)
{
	return new Hash(algorithm);
}

exports._tls = tm.TLS_ENABLED;
exports.randomBytes = randomBytes;
exports.pseudoRandomBytes = randomBytes; // todo real
exports.createHmac = createHmac;
exports.createHash = createHash;
