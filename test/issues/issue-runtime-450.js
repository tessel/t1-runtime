var tap = require('../tap');
tap.count(2)

tap.eq("x".replace(/x/, function () { return {}; }), "[object Object]", "basic");
tap.eq("x".replace(/x/, function () { return /h/i; }), "/h/i", "regex");
