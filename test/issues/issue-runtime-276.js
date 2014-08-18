var tap = require('../tap')

tap.count(1)

try {
  require("MISSING");
} catch (e) {
    var msg = e.toString();
    tap.ok(msg.match(/find module .MISSING/), "no unexpected path in module resolution error");
}