// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var util = require('util'),
    _log = process._log;

function fmt_log() {
  var lvl = this,
      str = util.format.apply(util, arguments)
  _log(lvl, str);
}

exports.log = fmt_log.bind(10);
exports.info = fmt_log.bind(11);
exports.warn = fmt_log.bind(12);
exports.error = fmt_log.bind(13);
