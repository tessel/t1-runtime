local colony = require('colony');
local deps = {
["/Users/tim/Code/technical/colony/examples/helloworld.js"] = {
	func = function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

if console:log((_arr({[0]=("Hello"), ("world.")}):concat(_arr({[0]=("Welcome"), ("to"), ("Lua"), ("Colony")})):join((" ")) + ("!"))) then end;

return _module.exports;
end
,
deps = {  }
},
}

collectgarbage();
colony.global.process.env = colony.global._obj({ DEPLOY_IP = "10.1.90.97" });
return colony.enter(deps, "/Users/tim/Code/technical/colony/examples/helloworld.js")
