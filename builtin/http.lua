function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;




























local  util,  EventEmitter,  net,  ServerResponse,  ServerRequest,  HTTPServer,  HTTPIncomingResponse,  HTTPOutgoingRequest =  util,  EventEmitter,  net,  ServerResponse,  ServerRequest,  HTTPServer,  HTTPIncomingResponse,  HTTPOutgoingRequest;

 ServerResponse = (function (this, req,  socket)  local  self =  self;
  (this).req =  req;
  (this).socket =  socket;
  (this).headers =  _obj({  });
  (this)._header =  (false);
  (this)._closed =  (false);

   self = this;if 
  (this).req:on(("close"),  (function (this)  
(
    self)._closed =  (true);end))
 then end; end);

 ServerRequest = (function (this, socket)  local  self,  lastheader,  parser =  self,  lastheader,  parser;
   self = this;

  (this).headers =  _obj({  });
  (this).socket =  socket;
  (this).url =  (null);

   lastheader = nil;
  
 parser =  _new( tm__http__parser, ("request"),  








_obj({  ["on_message_begin"]= (function (this)  
end),  ["on_url"]= (function (this, url)  
(
      self).url =  url;end),  ["on_header_field"]= (function (this, field)  

      lastheader =  field;end),  ["on_header_value"]= (function (this, value)  
((
      self).headers)[lastheader:toLowerCase()] =  value;end),  ["on_headers_complete"]= (function (this, method)  
(
      self).method =  method;if 
      self:emit(("request"),  self) then end; end),  ["on_body"]= (function (this, body)  
if 
      self:emit(("data"),  body) then end; end),  ["on_message_complete"]= (function (this)  

if 
      self:emit(("close")) then end; (
      self)._closed =  (true);end),  ["on_error"]= (function (this, err)  if (
      self).socket:emit(("error"),  err)
     then end; end)}));if (this).socket:on(("data"),  (function (this, data)  

if 
    parser:write(data) then end; end))
 then end; end);




 HTTPServer = (function (this)  
local  self =  self;
   self = this;
  (this).socket =  net:createServer((function (this, socket)  
local  request,  response =  request,  response;
     request =  _new( ServerRequest, socket);
     response =  _new( ServerResponse, request,  socket);if 
    request:on(("request"),  (function (this)  if 
      self:emit(("request"),  request,  response)
     then end; end)) then end; end));end);

 HTTPIncomingResponse = (function (this, data)  

  (this).headers =  _obj({  });end);

 HTTPOutgoingRequest = (function (this, port,  host,  path,  method)  local  ipl,  ip,  self,  response,  lastheader,  parser =  ipl,  ip,  self,  response,  lastheader,  parser;
   ipl =  tm__hostname__lookup(global, host);
  if _truthy((ipl == (0))) then 

    _error( _new( Error, ("Could not lookup hostname.")))end
   ip =  _arr({[0]=_bit.band(_bit.rshift(ipl,  (0)),  (255)),  _bit.band(_bit.rshift(ipl,  (8)),  (255)),  _bit.band(_bit.rshift(ipl,  (16)),  (255)),  _bit.band(_bit.rshift(ipl,  (24)),  (255))}):join(("."));

   self = this;
  (this).socket =  net:connect(port,  ip,  (function (this)  

if (
    self).socket:write((((((method + (" /")) + path) + (" HTTP/1.1\r\nHost: ")) + host) + ("\r\n\r\n"))) then end; end))

  ; response = nil; lastheader = nil;
  
 parser =  _new( tm__http__parser, ("response"),  








_obj({  ["on_message_begin"]= (function (this)  

      response =  _new( HTTPIncomingResponse);end),  ["on_url"]= (function (this, url)  end),  ["on_header_field"]= (function (this, field)  

      lastheader =  field;end),  ["on_header_value"]= (function (this, value)  
((
      response).headers)[lastheader:toLowerCase()] =  value;end),  ["on_headers_complete"]= (function (this)  
if 
      console:log(response) then end; if 
      self:emit(("response"),  response) then end; end),  ["on_body"]= (function (this, body)  
if 
      response:emit(("data"),  body) then end; end),  ["on_message_complete"]= (function (this)  

if 
      response:emit(("close")) then end; if (
      self).socket:close() then end; end),  ["on_error"]= (function (this, err)  if (
      self).socket:emit(("error"),  err)
     then end; end)}));if (this).socket:on(("data"),  (function (this, data)  
if 
    parser:write(data) then end; end))
 then end; end); util =  require(global, ("util"));
 EventEmitter = ( require(global, ("events"))).EventEmitter;
 net =  require(global, ("net"));if 
util:inherits(ServerResponse,  EventEmitter) then end; ((

ServerResponse).prototype).setHeader =  (function (this, name,  value)  

  if _truthy((this)._header) then 

    _error( ("Already wrote HEAD"))end(
  (this).headers)[String(global, name):toLowerCase()] =  value;end);((

ServerResponse).prototype).setHeaders =  (function (this, headers)  
local  key =  key;
  for key in _pairs( headers) do 
if 
    this:setHeader(key,  headers[key]) then end; endend);((

ServerResponse).prototype).writeHead =  (function (this, status,  headers)  

local  key =  key;
  if _truthy((this)._header) then 

    _error( ("Already wrote HEAD"))end

  if _truthy(headers) then 
if 
    this:setHeaders(headers) then end; endif 
  (this).socket:write(((("HTTP/1.1 ") + status) + (" OK\r\n"))) then end; 
  for key in _pairs( (this).headers) do 
if 
    (this).socket:write((((key + (": ")) +( (this).headers)[key]) + ("\r\n"))) then end; endif 
  (this).socket:write(("Transfer-Encoding: chunked\r\n")) then end; if 
  (this).socket:write(("\r\n")) then end; 
  (this)._header =  (true);end);((

ServerResponse).prototype).write =  (function (this, data)  

  if (not _truthy((this)._header)) then 
if 
    this:writeHead((200)) then end; endif 

  (this).socket:write(Number(global, data.length):toString((16))) then end; if 
  (this).socket:write(("\r\n")) then end; if 
  (this).socket:write(data) then end; if 
  (this).socket:write(("\r\n")) then end; end)

;((ServerResponse).prototype)["end"] =  (function (this, data)  



  if (not _truthy((this)._header)) then 
if 
    this:writeHead((200)) then end; end
  if (data ~=  (null)) then 
if 
    this:write(data) then end; end
  (this)._closed =  (true);if 
  (this).socket:write(("0\r\n\r\n")) then end; if 
  (this).socket:close() then end; end);if 

util:inherits(ServerRequest,  EventEmitter) then end; if 

util:inherits(HTTPServer,  EventEmitter) then end; ((

HTTPServer).prototype).listen =  (function (this, port,  ip)  
if 
  (this).socket:listen(port,  ip) then end; end);if 
util:inherits(HTTPIncomingResponse,  EventEmitter) then end; ((

HTTPIncomingResponse).prototype).setEncoding =  (function (this)  

end);if 

util:inherits(HTTPOutgoingRequest,  EventEmitter) then end; ((

HTTPOutgoingRequest).prototype)["end"] =  (function (this)  


end);(

exports).request =  (function (this, opts,  onresponse)  
local  req =  req;
   req =  _new( HTTPOutgoingRequest, (opts).port or  (80), ( opts).hostname, ( opts).path or  (""), ( opts).method or  ("GET"));if 
  onresponse and  req:on(("response"),  onresponse) then end; 
  if true then return  req; end;end);(

exports).createServer =  (function (this, onrequest)  
local  server =  server;
   server =  _new( HTTPServer);if 
  onrequest and  server:on(("request"),  onrequest) then end; 
  if true then return  server; end;end);(

exports).ServerResponse =  ServerResponse;(
exports).ServerRequest =  ServerRequest;return _module.exports;end 