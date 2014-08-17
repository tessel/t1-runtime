var tap = require('../tap')

tap.count(1)

tap.eq('   text / x-lua  lua  !'.replace(/^\s*/g, ''), 'text / x-lua  lua  !', '/^\s*/ replaces only at BOL');
