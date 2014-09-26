// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.
var tm = process.binding('tm');

exports.resolve = function (domain, type, callback) {
  if (typeof type == 'function') {
    callback = type;
    type = null
  };

  // TODO use type

  var tries = 3;
  setImmediate(function poll () {
    console.log("DNS _sync_gethostbyname on domain", domain);
    // CC3000 can flake with cares. Three time's the charm.
  	var ipl = tm._sync_gethostbyname(domain);
  	if (ipl == 0) {
      tries--;
      if (tries > 0) {
        return poll();
      }
  		callback(new Error('ENOENT'));
  	} else {
    	callback(null, [[(ipl >> 24) & 0xFF, (ipl >> 16) & 0xFF, (ipl >> 8) & 0xFF, (ipl >> 0) & 0xFF].join('.')])
    }
  });
}

// TODO the rest!