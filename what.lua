function _with_fn1(_with)
--[[400]] console:log(((((internal(this))==(("internal")))) and {("ok 1")} or {("not ok 1")})[1]);
--[[462]] console:log(((((external(this))==(("external")))) and {("ok 2")} or {("not ok 2")})[1]);
--[[524]] obj.external = (function (this)
--[[555]] if true then return ("internal"); end
end);
--[[578]] console:log(((((external(this))==(("internal")))) and {("ok 3")} or {("not ok 3")})[1]);
--[[640]] a = (6);
return _with;
end
function _with_fn2(_with)
--[[742]] a = ((((PI)*(r)))*(r));
--[[760]] x = ((r)*(cos(this, PI)));
--[[779]] y = ((r)*(sin(this, ((PI)/((2))))));
return _with;
end


return function (_ENV, _module)
local exports, module = _module.exports, _module;


local t, tmax, ok, internal, external, obj, a, a, x, y, r = t, tmax, ok, internal, external, obj, a, a, x, y, r;
ok = (function () local ok = nil; ok = function (this, a, d)
--[[56]] console:log(((a) and {((((("ok "))+((function () local _r = t; t = _r + 1; return _r; end)())))+((" -")))} or {((((("not ok "))+((function () local _r = t; t = _r + 1; return _r; end)())))+((" -")))})[1], d);
end; ok.name = "ok"; return ok; end)();
--[[15]] t = (1);  tmax = (1); 
--[[35]] 
--[[127]] console:log(((((t)+((".."))))+(tmax)));
--[[157]] ok(this, process.versions.colony, ("running in colony"));
--[[207]] internal = (function (this)
--[[237]] if true then return ("external"); end
end); 
--[[259]] external = (function (this)
--[[289]] if true then return ("external"); end
end); 
--[[311]] obj = _obj({
  ["internal"]=(function (this)
--[[350]] if true then return ("internal"); end
end)
}); 
--[[375]] a = (5); 
--[[386]] local _ret = _with(obj, _G._with_fn1);if _ret ~= _with then return _ret end; 
--[[649]] console:log(((((a)==((6)))) and {("ok 4")} or {("not ok 4")})[1]);
--[[693]] t = (5);
--[[700]] a = nil;  x = nil;  y = nil; 
--[[713]] r = (10); 
--[[726]] local _ret = _with(Math, _G._with_fn2);if _ret ~= _with then return _ret end; 
--[[803]] ok(this, ((a)==(((Math.PI)*((100))))));
--[[826]] ok(this, ((x)==((-((10))))));
--[[839]] ok(this, ((y)==((10))));

return _module.exports;
end 
