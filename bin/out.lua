local colony = require('colony');
local deps = {
["/Users/tim/Code/technical/colony/examples/chain/one.js"] = {
	func = function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

local two = two;
two = require(global, ("./two"));
if two:hello() then end;

return _module.exports;
end
,
deps = { ["./two"] = "/Users/tim/Code/technical/colony/examples/chain/two.js" }
},
["/Users/tim/Code/technical/colony/examples/chain/two.js"] = {
	func = function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

console:log('hi', requireee, require, Array);
(exports)["hello"] = (require(global, ("./three")))["hello"];
if exports:hello() then end;

return _module.exports;
end
,
deps = { ["./three"] = "/Users/tim/Code/technical/colony/examples/chain/three.js" }
},
["/Users/tim/Code/technical/colony/examples/chain/three.js"] = {
	func = function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

(exports)["hello"] = _func(function (this)
if console:log(("hello!")) then end;
end);

return _module.exports;
end
,
deps = {  }
},
}

collectgarbage();
colony.global.process.env = colony.global._obj({ DEPLOY_IP = "192.168.1.11" });
return colony.enter(deps, "/Users/tim/Code/technical/colony/examples/chain/one.js")
