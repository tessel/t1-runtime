// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var util = require('util'),
    _log = process.binding('tm').log;

exports.log = function () {
	_log(10, util.format.apply(util, arguments));
}
exports.info = function () {
	_log(11, util.format.apply(util, arguments));
}
exports.warn = function () {
	_log(12, util.format.apply(util, arguments));
}
exports.error = function () {
	_log(13, util.format.apply(util, arguments));
}
