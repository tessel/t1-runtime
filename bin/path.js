var path = require('path');
exports.resolve = function (name, abs) {
	var precompiled = require('../package.json').name + '-bin-' + process.platform + '-' + process.arch + '/';
	var compiled = __dirname + '/build/' + (process.config.target_defaults.defaut_configuration || 'Release') + '/';
	try {
		require(precompiled + 'package.json');
	} catch (e) {
		return compiled + name;
	}
	return abs ? path.join(__dirname + '/../node_modules', precompiled + name) : precompiled + name;
};