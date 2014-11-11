var tap = require('../tap');

tap.count(2);

var semver = require('semver');

// Checks internal versions have been set.
console.log('#', JSON.stringify(process.versions, null, ''));
tap.ok(semver.gte(process.versions.node, '0.10.30'), 'node version reports >= 0.10.30');
tap.ok(semver.gte(process.versions.colony, '1.0.0'), 'colony version reports >= 1.0.0');
