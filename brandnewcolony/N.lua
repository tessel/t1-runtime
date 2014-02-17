return function (_ENV, _module)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local exports, module = _module.exports, _module;

local EventEmitter, stream, TestClass, t;
EventEmitter = (function (this)
local EventEmitter;
EventEmitter = function (this)

end

EventEmitter.prototype.listeners = (function (this, type)
if true then return (this.hasOwnProperty:call(((this._events)or((function () local _r =  _obj({
  
}); this._events  = _r; return _r; end)())), type) and {this._events[type]} or {(function () local _r =  _arr({}); this._events[type]  = _r; return _r; end)()})[1]; end
end);
EventEmitter.prototype.on = (function () local _r =  (function (this, type, f)
if ((((this._maxListeners)~=(0)))and(((this:listeners(type):push(f))>(((this._maxListeners)or(10)))))) then
if ((console)and(console:warn((((('Possible EventEmitter memory leak detected. ')+(this._events[type].length)))+(' listeners added. Use emitter.setMaxListeners() to increase limit.'))))) then end;
end;
if this:emit("newListener", type, f) then end;
if true then return this; end
end); EventEmitter.prototype.addListener  = _r; return _r; end)();
EventEmitter.prototype.once = (function (this, type, f)
if this:on(type, (function (this, ...)
local arguments = _arguments(...);
local g = _debug.getinfo(1, 'f').func;
if f:apply(this, arguments) then end;
if this:removeListener(type, g) then end;
end)) then end;
end);
EventEmitter.prototype.removeListener = (function (this, type, f)
local i;
i = null; 
if (((((function () local _r =  this:listeners(type):indexOf(f); i  = _r; return _r; end)())~=((-(1)))))and(this:listeners(type):splice(i, 1))) then end;
if true then return this; end
end);
EventEmitter.prototype.removeAllListeners = (function (this, type)
local k;
for k in _pairs(this._events) do
if (((((not (type)))or(((type)==(k)))))and(this._events[k]:splice(0, this._events[k].length))) then end;
end;
if true then return this; end
end);
EventEmitter.prototype.emit = (function (this, ...)
local type = ...;
local arguments = _arguments(...);
local args, i, fns;
args = Array.prototype.slice:call(arguments, 1); 
i = 0;  fns = this:listeners(type):slice(); 
while ((i)<(fns.length))do 
if fns[i]:apply(this, args) then end;
local _r = i; i = _r + 1;
end;
if true then return fns.length; end
end);
EventEmitter.prototype.setMaxListeners = (function (this, maxListeners)
this._maxListeners = maxListeners;
end);
if true then return EventEmitter; end
end)(this); 
stream = _new(EventEmitter); 
if stream:on('data', (function (this, data)
if console:log(data) then end;
end)) then end;
if stream:emit('data', 'Cool, this works.') then end;
TestClass = function (this)
this.str = "Extending works too!!!";
end

TestClass.prototype = _new(EventEmitter);
TestClass.prototype.hello = (function (this)
if this:emit('data', this.str) then end;
end);
t = _new(TestClass); 
if t:on('data', (function (this, data)
if console:log(data) then end;
end)) then end;
if t:hello() then end;

return _module.exports;
end 