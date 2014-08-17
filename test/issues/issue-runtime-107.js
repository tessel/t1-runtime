var tap = require('../tap')

tap.count(1)

tap.eq('Hello World'.replace(/\s|l*/g, ''), 'HeoWord', '/\s|l*/ replace');
tap.eq('Hello World'.replace(/l*/g, '_'), '_H_e__o_ _W_o_r__d_', '/l*/ replace');
