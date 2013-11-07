-- local evin = require('evinrude')

-- local cre = evin.regex_create()
-- print('cre ->', cre);
-- local pmatch = evin.regmatch_create(100)
-- print('pmatch ->', pmatch);
-- local str, rc = evin.re_comp(cre, "a(b+)(c+)d", evin.ADVANCED )
-- print('re_comp =>', rc)
-- print('regex_nsub =>', evin.regex_nsub(cre))

-- local data = "###abbbcd$$$"
-- local rc = evin.re_exec(cre, data, nil, 100, pmatch, 0)
-- print('re_exec =>', rc)
-- print('regex_nsub =>', evin.regex_nsub(cre))

-- for i=0,evin.regex_nsub(cre) do
--   local so, eo = evin.regmatch_so(pmatch, i), evin.regmatch_eo(pmatch, i)
--   print('match', i, '=> start:', so, ', end:', eo)
--   print(' -->', string.sub(data, so + 1, eo))
-- end

-- if true then return end

-- Get script source
if #arg < 1 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[1]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

-- preprocess yay
os.execute("node preprocessor 2> /dev/null");

-- print('Run mem:', collectgarbage('count'))
local colony = require('lib/colony')
collectgarbage()
colony.run(p)
colony.runEventLoop();
-- print('End mem:', collectgarbage('count'))