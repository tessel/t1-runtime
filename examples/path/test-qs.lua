function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;local  querystring =  querystring; querystring =  require(global, ("./module"));if 

console:log(querystring:stringify(_obj({  ["foo"]= ("bar"),  ["baz"]= _arr({[0]=("qux"),  ("quux")}),  ["corge"]= ("")})))
 then end; if console:log(querystring:stringify(_obj({  ["foo"]= ("bar"),  ["baz"]= ("qux")}),  (";"),  (":")))
 then end; if console:log(querystring:parse(("foo=bar&baz=qux&baz=quux&corge"))) then end; return _module.exports;end 