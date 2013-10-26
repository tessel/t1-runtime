function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;local  events,  util,  Stream =  events,  util,  Stream;

 Stream = (function (this)  
end); events =  require(global, ("events"));
 util =  require(global, ("util"));if 

util:inherits(Stream,  events.EventEmitter) then end; ((

Stream).prototype).write =  (function (this)  end)
;((Stream).prototype).pipe =  (function (this, target)  if 
  this:on(("data"),  (function (this, data)  
if 
    target:write(data) then end; end))
 then end; end)

;(exports).Stream =  Stream;return _module.exports;end 