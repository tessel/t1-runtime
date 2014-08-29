var tap = require('../tap');

tap.count(4);

tap.eq([1,2,3].join(), '1,2,3');
tap.eq([1,2,3].join('###'), '1###2###3');
tap.eq([1,2,3].join(1), '11213');
tap.eq([1,2,3].join(null), '1null2null3');
