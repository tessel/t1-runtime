function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;local  path =  path; path =  require(global, ("path"));if 

console:log(path:normalize(("/foo/bar//baz/asdf/quux/.."))) then end; if 
console:log(path:dirname(____filename)) then end; if 
console:log(path:basename(____filename)) then end; if 
console:log(path:basename(____filename,  (".js"))) then end; if 
console:log(path:join(("/foo"),  ("bar"),  ("baz/asdf"),  ("quux"),  (".."))) then end; if 
console:log(path:resolve(("foo/bar"),  ("/tmp/file/"),  (".."),  ("a/../subfile")))
 then end; if console:log(path:relative(("/data/orandea/test/aaa"),  ("/data/orandea/impl/bbb")))
 then end; if console:log(path:extname(("index.html")))
 then end; if console:log(path.sep)
 then end; if console:log(path.delimiter) then end; return _module.exports;end 