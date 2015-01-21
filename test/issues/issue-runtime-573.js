var tap = require('../tap');

tap.count(1);

iCalled();

function iCalled() { callMeMaybe(); }
function callMeMaybe() {
    tap.ok(arguments.callee== callMeMaybe,'function callee');
}
