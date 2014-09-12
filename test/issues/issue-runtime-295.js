var tap = require('../tap');

tap.count(3);

tap.ok(RegExp.prototype.hasOwnProperty('toString'), 'regex has own property toString');
tap.eq(/abc/g.toString(), '/abc/g', 'tostring method on regex');
tap.eq(/abc/mig.toString(), '/abc/gim', 'tostring method on regex orders flags by spec');
