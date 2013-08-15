local colony = require('colony');
local deps = {
["/Users/tim/Code/technical/colony/examples/fannkuch-redux.js"] = {
	func = function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

local fannkuch, n, pf = fannkuch, n, pf;
fannkuch = _func(function (this, n)
local fannkuch = _debug.getinfo(1, 'f').func;
local p, q, s, sign, maxflips, sum, m, i, q0, flips, qq, j, t, sx = p, q, s, sign, maxflips, sum, m, i, q0, flips, qq, j, t, sx;
p = Array(global, n);
q = Array(global, n);
s = Array(global, n);
sign = (1);
maxflips = (0);
sum = (0);
m = (n-(1));
i = (0);
while (i<n) do

(p)[i] = i;
(q)[i] = i;
(s)[i] = i;

(function () local _r = i; i = _r + 1; return _r end)()
end
repeat

q0 = (p)[(0)];
if (q0 ~= (0)) then
i = (1);
while (i<n) do

(q)[i] = (p)[i];

(function () local _r = i; i = _r + 1; return _r end)()
end
flips = (1);
repeat

qq = (q)[q0];
if _truthy((qq == (0))) then
sum = sum + (sign*flips);
if (flips > maxflips) then
maxflips = flips;
end
_c = _break; break;
end
(q)[q0] = q0;
if (q0 >= (3)) then
i = (1);
j = (q0 - (1));
t = nil;
repeat

t = (q)[i];
(q)[i] = (q)[j];
(q)[j] = t;
(function () local _r = i; i = _r + 1; return _r end)();
(function () local _r = j; j = _r - 1; return _r end)();

until not (i < j);
end
q0 = qq;
(function () local _r = flips; flips = _r + 1; return _r end)();

until not _truthy((true));
end
if _truthy((sign == (1))) then
t = (p)[(1)];
(p)[(1)] = (p)[(0)];
(p)[(0)] = t;
sign = (-(1));
else
t = (p)[(1)];
(p)[(1)] = (p)[(2)];
(p)[(2)] = t;
sign = (1);
i = (2);
while (i<n) do

sx = (s)[i];
if (sx ~= (0)) then
(s)[i] = (sx-(1));
_c = _break; break;
end
if _truthy((i == m)) then
if true then return Array(global, sum, maxflips); end;
end
(s)[i] = i;
t = (p)[(0)];
j = (0);
while (j<=i) do

(p)[j] = (p)[(j+(1))];

(function () local _r = j; j = _r + 1; return _r end)()
end
(p)[(i+(1))] = t;

(function () local _r = i; i = _r + 1; return _r end)()
end
end

until not _truthy((true));
end);
n = (((1)*(10))*(1));
pf = fannkuch(global, n);
if console:log(((((((pf)[(0)] + ("\n")) + ("Pfannkuchen(")) + n) + (") = ")) + (pf)[(1)])) then end;

return _module.exports;
end
,
deps = {  }
},
}

collectgarbage();
colony.global.process.env = colony.global._obj({ DEPLOY_IP = "10.10.10.138" });
print(collectgarbage'count')
colony.enter(deps, "/Users/tim/Code/technical/colony/examples/fannkuch-redux.js")
print(collectgarbage'count')
