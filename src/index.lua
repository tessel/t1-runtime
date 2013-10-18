function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local fs, falafel, colors, path, mdeps, JSONStream, luamin, colonize, runlua, luastringifytable, bundleDependencies, bundleFiles = fs, falafel, colors, path, mdeps, JSONStream, luamin, colonize, runlua, luastringifytable, bundleDependencies, bundleFiles;
runlua = (function (this, luacode)
local runlua = _debug.getinfo(1, 'f').func;
local lua = lua;
luacode = (((("package.path = ") + JSON:stringify((path:join(____dirname, ("../lib")) + ("/?.lua;")))) + (" .. package.path; \n")) + luacode);
lua = require(global, ("child_process")):spawn(path:join(____dirname, ("../bin/lua-5.2.2/src/lua")), _arr({[0]=("-e"), luacode}));
if (process).stdin:pipe(lua.stdin) then end;
if (lua).stdout:on(("data"), (function (this, str)
if (process).stdout:write(String(global, str)) then end;
end)) then end;
if (lua).stderr:on(("data"), (function (this, str)
if (process).stderr:write(String(global, str).yellow) then end;
end)) then end;
if lua:on(("close"), (function (this, code)
if process:exit(code) then end;
end)) then end;
end);
luastringifytable = (function (this, obj)
local luastringifytable = _debug.getinfo(1, 'f').func;
if true then return ((("{ ") + Object:keys(obj):map((function (this, key)
if true then return (((("[") + JSON:stringify(key)) + ("] = ")) + JSON:stringify(obj[key])); end;
end)):join((", "))) + (" }")); end;
end);
bundleDependencies = (function (this, deps, opts, next)
local bundleDependencies = _debug.getinfo(1, 'f').func;
local out, code = out, code;
if (not (next)) then
next = opts;
opts = _obj({
  });
end
out = _arr({});
if _truthy((opts).bundleLib) then
if out:push(((("local colony = (function ()\n") + fs:readFileSync(path:join(____dirname, ("../lib/colony.lua")))) + ("\nend)()\n"))) then end;
else
if out:push(("local colony = require('colony');")) then end;
end
if out:push(("local deps = {"))
   then end;
if deps:forEach((function (this, dep)
if out:push((((("[") + JSON:stringify(dep.id)) + ("] = {\n\tfunc = ")) + colonize(global, dep.source))) then end;
if out:push((((",\ndeps = ") + luastringifytable(global, dep.deps)) + ("\n},"))) then end;
end)) then end;
if out:push(("}"))
   then end;
if out:push(("")) then end;
if out:push(("collectgarbage();")) then end;
if out:push(((("colony.global.process.env = colony.global._obj({ DEPLOY_IP = ") + JSON:stringify(require(global, ("my-local-ip"))(global))) + (" });"))) then end;
if out:push(((("return colony.enter(deps, ") + JSON:stringify((deps:filter((function (this, dep)
if true then return (dep).entry; end;
end)))[(0)].id)) + (")"))) then end;
code = out:join(("\n"));
if next(global, (_truthy((opts).minify) and {luamin:minify(code)} or {code})[1]) then end;
end);
bundleFiles = (function (this, srcs, opts, next)
local bundleFiles = _debug.getinfo(1, 'f').func;
local inject, stringify, buf = inject, stringify, buf;
if (not (next)) then
next = opts;
opts = _obj({
  });
end
inject = (opts).inject or _obj({
  });
stringify = JSONStream:stringify();
buf = _arr({});
if stringify:on(("data"), (function (this, data)
if buf:push(data) then end;
end)) then end;
if stringify:on(("close"), (function (this)
local deps = deps;
deps = JSON:parse(buf:join(("")));
if bundleDependencies(global, deps, opts, next) then end;
end)) then end;
if mdeps(global, srcs, _obj({
  ["filter"]=(function (this, id)
if true then return (not (_in(id, inject))) or ((inject)[id] ~= (null)); end;
end),
  ["resolve"]=(function (this, ...)
local arguments = _arguments(...);
local id, info, cb = ...;
if _in(id, inject) then
if _truthy(((inject)[id] == (null))) then
if cb(global, (null), (null), (null)) then end;
else
if require(global, ("browser-resolve"))(global, ((inject)[id] + ("/index.js")), ____filename, cb) then end;
end
else
if require(global, ("browser-resolve")):apply((null), arguments) then end;
end
end)})):pipe(stringify) then end;
end);
fs = require(global, ("fs"));
falafel = require(global, ("falafel"));
colors = require(global, ("colors"));
path = require(global, ("path"));
mdeps = require(global, ("module-deps"));
JSONStream = require(global, ("JSONStream"));
luamin = require(global, ("luamin"));
colonize = require(global, ("./colonize"));
(exports).colonize = colonize;
(exports).bundleFiles = bundleFiles;
(exports).bundleDependencies = bundleDependencies;
(exports).runlua = runlua;

return _module.exports;
end