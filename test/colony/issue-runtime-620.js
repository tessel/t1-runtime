var tap = require('../tap');
tap.count(1)
global._G.collectgarbage.call('collect')
tap.ok(true, 'collectgarbage call through JS succeeded.')
