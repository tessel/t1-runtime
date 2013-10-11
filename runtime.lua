-- collectgarbage()
-- print('Start mem:', collectgarbage('count'))

local ffi = require('ffi')
ffi.cdef[[
  typedef int tm_socket_t;
  static int const TM_SOCKET_INVALID = 0;

  tm_socket_t tm_udp_open ();
  tm_socket_t tm_tcp_open ();
  int tm_tcp_close (tm_socket_t sock);
  int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
  int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_readable (tm_socket_t sock);
  uint32_t tm_hostname_lookup (uint8_t *hostname);
  int tm_tcp_listen (tm_socket_t sock, int port);
  int tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

  size_t strlen(const char * str);
  int printf(const char *fmt, ...);

typedef struct http_parser http_parser;
typedef struct http_parser_settings http_parser_settings;

  typedef int (*http_data_cb) (http_parser*, const char *at, size_t length);
  typedef int (*http_cb) (http_parser*);

  struct http_parser {
    /** PRIVATE **/
    unsigned char type : 2;     /* enum http_parser_type */
    unsigned char flags : 6;    /* F_* values from 'flags' enum; semi-public */
    unsigned char state;        /* enum state from http_parser.c */
    unsigned char header_state; /* enum header_state from http_parser.c */
    unsigned char index;        /* index into current matcher */

    uint32_t nread;          /* # bytes read in various scenarios */
    uint64_t content_length; /* # bytes in body (0 if no Content-Length header) */

    /** READ-ONLY **/
    unsigned short http_major;
    unsigned short http_minor;
    unsigned short status_code; /* responses only */
    unsigned char method;       /* requests only */
    unsigned char http_errno : 7;

    /* 1 = Upgrade header was present and the parser has exited because of that.
     * 0 = No upgrade header present.
     * Should be checked when http_parser_execute() returns in addition to
     * error checking.
     */
    unsigned char upgrade : 1;

    /** PUBLIC **/
    void *data; /* A pointer to get hook to the "connection" or "socket" object */
  };

  struct http_parser_settings {
    http_cb      on_message_begin;
    http_data_cb on_url;
    http_cb      on_status_complete;
    http_data_cb on_header_field;
    http_data_cb on_header_value;
    http_cb      on_headers_complete;
    http_data_cb on_body;
    http_cb      on_message_complete;
  };

  unsigned long http_parser_version(void);

  void http_parser_init(http_parser *parser, enum http_parser_type type);


  size_t http_parser_execute(http_parser *parser,
                             const http_parser_settings *settings,
                             const char *data,
                             size_t len);


  /* If http_should_keep_alive() in the on_headers_complete or
   * on_message_complete callback returns 0, then this should be
   * the last message on the connection.
   * If you are the server, respond with the "Connection: close" header.
   * If you are the client, close the connection.
   */
  int http_should_keep_alive(const http_parser *parser);

  /* Returns a string version of the HTTP method. */
  const char *http_method_str(enum http_method m);

  /* Return a string name of the given error */
  const char *http_errno_name(enum http_errno err);

  /* Return a string description of the given error */
  const char *http_errno_description(enum http_errno err);

  /* Parse a URL; return nonzero on failure */
  int http_parser_parse_url(const char *buf, size_t buflen,
                            int is_connect,
                            struct http_parser_url *u);

  /* Pause or un-pause the parser; a nonzero value pauses */
  void http_parser_pause(http_parser *parser, int paused);

  /* Checks if this is the final chunk of the body. */
  int http_body_is_final(const http_parser *parser);

  enum http_method
  {
  HHHHHHH
  };

  enum http_parser_type { HTTP_REQUEST, HTTP_RESPONSE, HTTP_BOTH };


  typedef void* tm_regex_t;

typedef struct {
  void *a;
  void *b;
} tm_regex_group_t;

tm_regex_t tm_regex_compile (const char *str);
int tm_regex_exec (tm_regex_t regex, const char *str, tm_regex_group_t *groups, size_t group_count);
void tm_regex_sub (const char *src, char *buf, size_t buf_len, tm_regex_group_t *groups, size_t group_count);
]]

--------------------

-- Returns directory name component of path
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua


function readfile (name)
  local prefix = ''
  local fp = assert(io.open(prefix..name))
  local s = fp:read("*a")
  assert(fp:close())
  return s
end

local LUA_DIRSEP = '/'
 
-- https://github.com/leafo/lapis/blob/master/lapis/cmd/path.lua
local function path_normalize (path)
  return string.gsub(string.gsub(path, "[^/]+/../", "/"), "%./", "")
end

local function fs_exists (path)
  local file = io.open(path)
  if file then
    return file:close() and true
  end
end

-- Returns string with any leading directory components removed. If specified, also remove a trailing suffix. 
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua
local function path_basename (string_, suffix)
  string_ = string_ or ''
  local basename = string.gsub (string_, '[^'.. LUA_DIRSEP ..']*'.. LUA_DIRSEP ..'', '')
  if suffix then
    basename = string.gsub (basename, suffix, '')
  end
  return basename
end

local function path_dirname (string_)
  string_ = string_ or ''
  -- strip trailing / first
  string_ = string.gsub (string_, LUA_DIRSEP ..'$', '')
  local basename = path_basename(string_)
  string_ = string.sub(string_, 1, #string_ - #basename - 1)
  return(string_)  
end

-------------

function colonize (name)
  local f = assert(io.popen('colony -c ' .. name, 'r'))
  local s = assert(f:read('*a'))
  f:close()
  return assert(loadstring('return ' .. s, "@"..name))()
end

local colony = require('lib/colony')

-------------

-- Lua API for colony

local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
end

colony.global.tm__hostname__lookup = function (ths, host)
  return ffi.C.tm_hostname_lookup(ffi.cast('uint8_t *', host))
end
colony.global.tm__tcp__open = function (ths)
  return ffi.C.tm_tcp_open()
end
colony.global.tm__tcp__close = function (ths, sock)
  return ffi.C.tm_tcp_close(sock)
end
colony.global.tm__tcp__connect = function (ths, sock, ip0, ip1, ip2, ip3, port)
  return ffi.C.tm_tcp_connect(sock, ip0, ip1, ip2, ip3, port)
end
colony.global.tm__tcp__write = function (ths, sock, buf, buflen)
  return ffi.C.tm_tcp_write(sock, ffi.cast('uint8_t *', buf), buflen)
end
colony.global.tm__tcp__read = function (ths, socket)
  local server_reply = ffi.new("char[2000]");
  if ffi.C.tm_tcp_read(socket, server_reply, 2000) < 0 then
    print("recv failed");
    return nil
  end
  return ffi.string(server_reply)
end
colony.global.tm__tcp__readable = function (ths, sock)
  return ffi.C.tm_tcp_readable(sock)
end
colony.global.tm__tcp__listen = function (this, sock, port)
  return ffi.C.tm_tcp_listen(sock, port)
end
colony.global.tm__tcp__accept = function (this, sock)
  local ip = ffi.new("uint32_t[1]");
  return ffi.C.tm_tcp_accept(sock, ip)
end

-- local instr = "sing me 99 red balloons"

-- local regex = ffi.C.tm_regex_compile("[0-9]+")
-- local groups = ffi.new("tm_regex_group_t[10]")
-- local buf = ffi.new("char[500]")
-- local res = ffi.C.tm_regex_exec(regex, instr, groups, 10)
-- print('matches:', res)
-- ffi.C.tm_regex_sub("100", buf, 500, groups, 10)
-- print(ffi.string(buf))

-- if true then return end

------------------

colony.global.tm__http__parser = function (this, type, cb)
  local settings = ffi.new("http_parser_settings[1]");
  this.on_error = cb.on_error
  settings[0].on_message_begin = function (parser)
    -- print('on_message_begin')
    if cb.on_message_begin then
      return cb.on_message_begin(this) or 0
    end
    return 0;
  end
  settings[0].on_url = function (parser, buf, buf_len)
    if cb.on_url then
      return cb.on_url(this, ffi.string(buf, buf_len)) or 0
    end
    return 0;
  end
  settings[0].on_status_complete = function (parser)
    if cb.on_status_complete then
      return cb.on_status_complete(this, ffi.string(parser.method)) or 0
    end
    return 0;
  end
  settings[0].on_header_field = function (parser, buf, buf_len)
    if cb.on_header_field then
      return cb.on_header_field(this, ffi.string(buf, buf_len)) or 0
    end
    return 0;
  end
  settings[0].on_header_value = function (parser, buf, buf_len)
    if cb.on_header_value then
      return cb.on_header_value(this, ffi.string(buf, buf_len)) or 0
    end
    return 0;
  end
  settings[0].on_headers_complete = function (parser)
    if cb.on_headers_complete then
      return cb.on_headers_complete(this, ffi.string(ffi.C.http_method_str(parser[0].method))) or 0
    end
    return 0;
  end
  settings[0].on_body = function (parser, buf, buf_len)
    if cb.on_body then
      return cb.on_body(this, ffi.string(buf, buf_len)) or 0
    end
    return 0;
  end
  settings[0].on_message_complete = function (parser)
    if cb.on_message_complete then
      return cb.on_message_complete(this) or 0
    end
    return 0;
  end

  local parser = ffi.new("http_parser[1]");
  if type == 'request' then
    ffi.C.http_parser_init(parser, ffi.C.HTTP_REQUEST)
  else
    ffi.C.http_parser_init(parser, 1)
  end

  this.__settings = settings
  this.__parser = parser
end

colony.global.tm__http__parser.prototype.write = function (this, str)
  local nparsed = ffi.C.http_parser_execute(this.__parser, this.__settings, str, string.len(str))
  if nparsed ~= string.len(str) and this.on_error then
    this:on_error('Could not parse tokens at character #' .. tostring(nparsed))
  end
  -- if (parser->upgrade) {
  --   /* handle new protocol */
  --     puts("UPGRADE");
  -- } else if (nparsed != nread) {
  --   /* Handle error. Usually just close the connection. */
  --     puts("ERROR");
  --     break;
  -- }
  return nparsed
end

-- http_parser_settings settings;
-- settings.on_url = my_url_callback;
-- settings.on_message_begin = my_message_begin;
-- settings.on_status_complete = my_status_complete;
-- settings.on_header_field = my_header_field_callback;
-- settings.on_header_value = my_header_field_callback;
-- settings.on_headers_complete = my_headers_complete;
-- settings.on_body = my_body_callback;
-- settings.on_message_complete = my_message_end;
-- /* ... */

-- http_parser *parser = malloc(sizeof(http_parser));
-- http_parser_init(parser, HTTP_RESPONSE);
-- parser->data = &server_reply;

-- int nparsed = http_parser_execute(parser, &settings, server_reply, nread);
-- // puts(server_reply);
-- // printf("Parsed: %d of %d\n", nparsed, nread);

-- if (parser->upgrade) {
--   /* handle new protocol */
--     puts("UPGRADE");
-- } else if (nparsed != nread) {
--   /* Handle error. Usually just close the connection. */
--     puts("ERROR");
--     break;
-- }

------------------

-- Run that runtime

local colony_cache = {}

function colony_run (name, root)
  root = root or './'
  -- print('<-', root, name)
  if string.sub(name, -3) == '.js' then
    name = string.sub(name, 1, -4)
  end 

  if string.sub(name, 1, 1) ~= '.' then
    if fs_exists('./builtin/' .. name .. '.js') then
      root = './builtin/'
      name = name .. '.js'
    else
      -- TODO climb hierarchy for node_modules
      local fullname = name
      while string.find(name, '/') do
        name = path_dirname(name)
      end
      while not fs_exists(root .. 'node_modules/' .. name) and not fs_exists(root .. 'node_modules/' .. name .. '/package.json') and string.find(path_dirname(root), "/") do
        root = path_dirname(root) .. '/'
      end
      if not root then
        error('Could not find installed module "' .. p .. '"')
      end
      root = root .. 'node_modules/'
      if string.find(fullname, '/') then
        name = fullname
      else
        _, _, label = string.find(readfile(root .. name .. '/package.json'), '"main"%s-:%s-"([^"]+)"')
        name = name .. '/' .. label
      end
    end
  end
  if string.sub(name, -3) ~= '.js' then
    name = name .. '.js'
  end
  local p = path_normalize(root .. name)
  -- print('->', p)

  local res = colony_cache[p]
  if not res then
    res = assert(loadstring('return ' .. readfile(string.sub(p, 1, -4) .. '.lua'), "@"..p))()
  end
  -- local res = colony_cache[p] or colonize(p)
  colony_cache[p] = res
  if not res then
    error('Could not find module "' .. p .. '"')
  end

  setfenv(res, colony.global)
  colony.global.require = function (ths, value)
    local scriptpath = string.sub(debug.getinfo(2).source, 2)
    return colony_run(value, path_dirname(scriptpath) .. '/')
  end
  return res()
end

-- os.execute("node preprocessor 2> /dev/null");

collectgarbage()
local p = arg[0]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end
print('Run mem:', collectgarbage('count'))
colony_run(p)

print('End mem:', collectgarbage('count'))