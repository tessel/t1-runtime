#!/usr/bin/env node

var fs = require('fs');

var data = fs.readFileSync('colony.log', 'utf-8');

var traces = data.match(/(^|\n)stack traceback:[\s\S]+?(\n\n|\s*?$)/g);

var sections = {
	C: {},
	T: {},
	app: {}
};

traces.map(function (trace) {
	var lines = trace.split(/\t\s*/).slice(2, 3);
	lines.forEach(function (line) {
		var entries = line.split(/: in ?f?u?n?c?t?i?o?n?\s*/);
		var line = (entries[0] + ' in ' + (entries[1] || '?')).replace(/[\n\s]*$/, '').replace(/__/g, '_');
		if (!line.match(/[^a-z0-9\/.\[\]A-Z:_$<>\?\'_\- ]/)) {
			if (line.match(/^\[T\]/) || line.match(/^builtin\//)) {
				var t = sections.T;
			} else if (line.match(/^\[C\]/)) {
				var t = sections.C;
			} else {
				var t = sections.app;
			}
			t[line] || (t[line] = 0);
			t[line]++;
		}
	});
})

Object.keys(sections).map(function (ticktype) {
	var ticks = sections[ticktype];
	console.log('functions by tick in section [' + ticktype + ']');
	Object.keys(ticks).map(function (key) {
		return [key, ticks[key]];
	}).sort(function (a, b) {
		return a[1] > b[1] ? -1 : a[1] < b[1] ? 1 : 0;
	}).reverse().forEach(function (tick) {
		console.log(('        ' + tick[1]).slice(-8), tick[0]);
	});
	console.log('');
});
