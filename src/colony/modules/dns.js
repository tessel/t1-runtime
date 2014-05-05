var tm = process.binding('tm');

exports.resolve = function (domain, type, callback) {
  if (typeof type == 'function') {
    callback = type;
    type = null
  };

  // TODO use type

  var tries = 3;
  setImmediate(function poll () {
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