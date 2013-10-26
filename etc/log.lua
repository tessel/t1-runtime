function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;local  a,  b =  a,  b;
 a =  _obj({  });(a).hello =  ("A")
;if console:log(("A:"),  a.hello)
 then end; if Object:defineProperties(a,  

_obj({  ["hello"]= 

_obj({  ["get"]= (function (this)  

      if true then return  ("B"); end;end)})})) then end; if (function () local base, prop = 
a, "__defineSetter__"; return base[prop](base, ("hello"),  (function (this, val)  
if 
  console:log(("called setter (C):"),  val) then end; end)); end)() then end; if 
console:log(("B:"),  a.hello) then end; (
a).hello =  ("C")
;if console:log(("B:"),  a.hello) then end; if 

console:log() then end; 

 b =  _obj({  });(
b).hello =  ("A");if 
console:log(("A:"),  b.hello) then end; if (function () local base, prop = 
b, "__defineSetter__"; return base[prop](base, ("hello"),  (function (this, val)  if 
  console:log(("called setter: (B)"),  val)
 then end; end)); end)() then end; (
b).hello =  ("B");if 
console:log(("A:"),  b.hello) then end; return _module.exports;end 