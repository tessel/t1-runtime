/**
 * Module API
 */

exports.colonize = require('./colonize');

exports.toBytecode = function (lua, f, next) {
  next = typeof f == 'function' ? f : next;
  f = typeof f == 'string' ? f : 'usercode.js';
  next(null, require('../bin/bytecode').compile(lua, '@' + f));
};