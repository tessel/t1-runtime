var tap = require('../tap');
tap.count(4)

tap.eq("x".replace(/x/, function () { return {}; }), "[object Object]", "basic");
tap.eq("x".replace(/x/, function () { return /h/i; }), "/h/i", "regex");
tap.eq("x".replace(/x/, function () { return true; }), "true", "boolean");
tap.eq("x".replace(/x/, function () { return (void 0); }), "undefined", "undefined");
//tap.eq("x".replace(/x/, function () { return null; }), "null", "null");
