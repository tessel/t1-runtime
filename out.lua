
local _JS = require('colony-js');
local string, math = nil, nil;
local this, Object, Array, String, Math, require, console = _JS.this, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _module = {exports={}}; local exports = _module.exports;

local EventEmitter, stream;
EventEmitter = _JS._func(function (this)
local EventEmitter;
EventEmitter = _JS._func(function (this)

end);
EventEmitter.prototype.listeners = _JS._func(function (this, type)
if true then return (_JS._truthy(this.hasOwnProperty:call(this.__events or (function () local _r = _JS._obj({}); this.__events = _r; return _r; end)(), type)) and {this.__events[type]} or {(function () local _r = _JS._arr({}); this.__events[type] = _r; return _r; end)()})[1]; end;
end);
EventEmitter.prototype.on = (function () local _r = _JS._func(function (this, type, f)
if _JS._truthy((this.__maxListeners ~= (0)) and (this:listeners(type):push(f) > (this.__maxListeners or (10)))) then
if console and console:warn(((("Possible EventEmitter memory leak detected. ") + this.__events[type].length) + (" listeners added. Use emitter.setMaxListeners() to increase limit."))) then end;
end
this:emit(("newListener"), type, f);
if true then return this; end;
end); EventEmitter.prototype.addListener = _r; return _r; end)();
EventEmitter.prototype.once = _JS._func(function (this, type, f)
local g;
this:on(type, _JS._func(function (this, ...)
local arguments = _JS._arr((function (...) return arg; end)(...)); arguments:shift();
f:apply(this, arguments);
this:removeListener(type, g) ;
end));
end);
EventEmitter.prototype.removeListener = _JS._func(function (this, type, f)
local i;
i = nil;
if ((function () local _r = this:listeners(type):indexOf(f); i = _r; return _r; end)() ~= ((-(1)))) and this:listeners(type):splice(i, (1)) then end;
if true then return this; end;
end);
EventEmitter.prototype.removeAllListeners = _JS._func(function (this, type)
local k;
for k in pairs(this.__events) do
if ((not type)) or (type == k) and this.__events[k]:splice((0), this.__events[k].length) then end;
end
if true then return this; end;
end);
EventEmitter.prototype.emit = _JS._func(function (this, ...)
local arguments = _JS._arr((function (...) return arg; end)(...)); arguments:shift();
local type = ...;
local args, i, fns;
args = Array.prototype.slice:call(arguments, (1));
i, fns = (0), this:listeners(type):slice();
while (i < fns.length) do

fns[i]:apply(this, args);

(function () local _r = i; i = _r + 1; return _r end)()
end
if true then return fns.length; end;
end);
EventEmitter.prototype.setMaxListeners = _JS._func(function (this, maxListeners)
this.__maxListeners = maxListeners;
end);
if true then return EventEmitter; end;
end)(this);
stream = _JS._new(EventEmitter);
stream:on(("data"), _JS._func(function (this, data)
console:log(data);
end));
stream:emit(("data"), ("Cool, this works."));

return _module.exports;
