exports.join = function () {
  // TODO
  return "";
};

exports.basename = function (file, end) {
  var ret = file.replace(/^.*\//, '');
  if (end != null) {
    if (ret.substr(-end.length) == end) {
      return ret.substr(0, ret.length-end.length);
    } else {
      return null;
    }
  }
  return ret;
};