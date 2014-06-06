#!/usr/bin/env node

var fs = require('fs');
var exec = require('child_process').exec;
var packageFolder = require('./package-folder');

var out = process.argv[2];
var pemdir = out + '.pem/';
var derdir = out + '.der/';
var infile = process.argv[4];

var pem = fs.readFileSync(infile, 'utf-8');
var certs = pem.split(/\n\n/g).filter(function (cert) {
	return cert.indexOf('---') > -1;
});

try {
	fs.mkdirSync(pemdir);
} catch (e) { }
try {
	fs.mkdirSync(derdir);
} catch (e) { }

var outfiles = [];
var i = 0;
(function loop () {
	var cert = certs[i];

	var incert = pemdir + 'cert-' + i + '.pem';
	var outcert = derdir + 'cert-' + i + '.der';
	outfiles.push(outcert);

	fs.writeFileSync(incert, cert);
	exec('openssl x509 -in ' + incert + ' -inform PEM -out ' + outcert + ' -outform DER', function (code, stdout, stderr) {
		if (code) {
			console.log(stdout);
			console.error(stderr);
			process.exit(code);
		}
		i++;
		if (certs.length > i) {
			loop();
		} else {
			packageFolder(outfiles, process.argv[3], function (err, out) {
				fs.writeFileSync(process.argv[2], out);
			});
		}
	})
})();