var tm = process.binding('tm');

exports.resolve = function (domain, type, callback) {
  if (typeof type == 'function') {
    callback = type;
    type = null
  };

  // TODO use type
  setImmediate(function () {
  	var ipl = tm._sync_gethostbyname(domain);
  	if (ipl == 0) {
  		callback(new Error('ENOENT'));
  	} else {
  		callback(null, [[(ipl >> 24) & 0xFF, (ipl >> 16) & 0xFF, (ipl >> 8) & 0xFF, (ipl >> 0) & 0xFF].join('.')])
  	}
  });
}

// TODO the rest!