// TODO not tessel-specific

exports.tmpdir = exports.tmpDir = function () {
	return '/tmp/';
}

exports.endianness = function () {
	return 'LE';
}

exports.hostname = function () {
	return 'tessel.local';
}

exports.type = function () {
	return 'Tessel'
}

exports.platform = function () {
	return 'tessel'
}

exports.arch = function () {
	return 'thumb2'
}

exports.release = function () {
	return '0.0.1';
}

exports.uptime = function () {
	var tm = process.binding('tm');
	return tm.uptime_micro()
}

exports.loadavg = function () {
	return [0, 0, 0];
}

exports.totalmem = function () {
	return 32*1024*1024;
}

exports.freemem = function () {
	return exports.totalmem() - (process.memoryUsage().heapUsed*1024);
}

exports.cpus = function () {
	return [
		{ model: 'Intel(R) Core(TM) i7 CPU         860  @ 2.80GHz',
	    speed: 2926,
	    times:
	     { user: 252020,
	       nice: 0,
	       sys: 30340,
	       idle: 1070356870,
	       irq: 0 } }
	]
}

exports.networkInterfaces = function () {
	try {
		var hw = process.binding('hw');
	} catch (e) {
		return {}
	}
	if (!hw.is_connected()) {
		return {};
	}
	var ipl = hw.local_ip();
	var strip = [(ipl >> 24) & 0xFF, (ipl >> 16) & 0xFF, (ipl >> 8) & 0xFF, (ipl >> 0) & 0xFF].join('.');
	return {
		lo0: 
		   [ { address: '::1', family: 'IPv6', internal: true },
		     { address: 'fe80::1', family: 'IPv6', internal: true },
		     { address: '127.0.0.1', family: 'IPv4', internal: true } ],
		en1: [
			{ address: strip, family: 'IPv4', internal: false }
		]
	}
}

exports.EOL = '\n'