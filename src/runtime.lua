-- collectgarbage()
-- print('Start mem:', collectgarbage('count'))

----------------

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
  while string.find(path, "%w+/%.%./") or string.find(path, "/%./") do
    path = string.gsub(path, "%w+/%.%./", "/")
    path = string.gsub(path, "/%./", "/")
  end
  return path
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

-- Lua API for colony

function js_wrap_module (module)
  local m = {}
  setmetatable(m, {
    __index = function (this, key)
      if type(module[key]) == 'function' then
        local fn = function (this, ...)
          return module[key](...)
        end
        this[key] = fn
      else
        this[key] = module[key]
      end
      return this[key]
    end
  })
  return m
end

local tm = require('tm')
local http_parser = require('http_parser')

_G._colony_binding_tm = js_wrap_module(tm)
_G._colony_binding_http_parser = js_wrap_module(http_parser)

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
        name = name .. '/' .. (label or 'index.js')
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
    res = assert(loadstring('return ' .. readfile(string.reverse(string.gsub(string.reverse(string.sub(p, 1, -4)), '/', '~/', 1)) .. '.colony'), "@"..p))()
  end
  -- local res = colony_cache[p] or colonize(p)
  colony_cache[p] = res
  if not res then
    error('Could not find module "' .. p .. '"')
  end

  setfenv(res, colony.global)
  colony.global.require = function (ths, value)
    local n = 2
    -- metamethods are tricky here
    while debug.getinfo(n).namewhat == 'metamethod' do
      n = n + 1
    end
    local scriptpath = string.sub(debug.getinfo(n).source, 2)
    return colony_run(value, path_dirname(scriptpath) .. '/')
  end
  return res()
end


-- Entry point

if #arg < 1 then
  print('Usage: colony script.js')
  return 1
end

os.execute("node preprocessor 2> /dev/null");

collectgarbage()
local p = arg[1]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end
-- print('Run mem:', collectgarbage('count'))

colony_run(p)
colony.runEventLoop();

-- print('End mem:', collectgarbage('count'))