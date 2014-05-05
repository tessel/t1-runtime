// Implements serialize/deserialize of structured clones.
// Also resolves cycles (code based on cycle.js by Douglas Crockford)

function encodeRegExp (regexp)
{
  var flags = '';
  if (regexp.global) flags += 'g';
  if (regexp.multiline) flags += 'm';
  if (regexp.ignoreCase) flags += 'i';
  return [flags, regexp.source].join(',');
}

function decodeRegExp (str)
{
  var flags = str.match(/^[^,]*/)[0];
  var source = str.substr(flags.length + 1);
  return new RegExp(source, flags);
}


// The derez recurses through the object, producing the deep copy.

function derez(value, path, objects, paths, buffers)
{
  if (Buffer.isBuffer(value)) {
    var start = Buffer.concat(buffers).length;
    buffers.push(value);
    return '\x10b' + [start, value.length].join(',')
  }
  if (value instanceof Date) {
    return '\x10d' + value.toJSON();
  }
  if (value instanceof RegExp) {
    return '\x10r' + encodeRegExp(value);
  }
  if (value instanceof Error) {
    return '\x10e' + value.message
  }
  if (typeof value == 'string') {
    return value.charAt(0) == '\x10' ? '\x10s' + value : value;
  }

  var i,          // The loop counter
    name,       // Property name
    nu;         // The new object or array

// typeof null === 'object', so go on if this value is really an object but not
// one of the weird builtin objects.

  if (typeof value === 'object' && value !== null &&
    !(value instanceof Boolean) &&
    !(value instanceof Number)  &&
    !(value instanceof String)) {

// If the value is an object or array, look to see if we have already
// encountered it. If so, return a $ref/path object. This is a hard way,
// linear search that will get slower as the number of unique objects grows.

    i = objects.indexOf(value);
    if (i !== -1) {
      return '\x10j' + paths[i];
    }

// Otherwise, accumulate the unique value and its path.

    objects.push(value);
    paths.push(path);

// If it is an array, replicate the array.

    if (Array.isArray(value)) {
      nu = [];
      for (i = 0; i < value.length; i += 1) {
        nu[i] = derez(value[i],
          path + '[' + i + ']',
          objects, paths, buffers);
      }
    } else {

// If it is an object, replicate the object.

      nu = {};
      for (name in value) {
        if (Object.prototype.hasOwnProperty.call(value, name) && value != '__proto__') {
          nu[name] = derez(value[name],
            path + '[' + JSON.stringify(name) + ']',
            objects, paths, buffers);
        }
      }
    }
    return nu;
  }

  return value;
}


function rerez($, $$)
{

// Restore an object that was reduced by decycle. Members whose values are
// objects of the form
//      {$ref: PATH}
// are replaced with references to the value found by the PATH. This will
// restore cycles. The object will be mutated.

// The eval function is used to locate the values described by a PATH. The
// root object is kept in a $ variable. A regular expression is used to
// assure that the PATH is extremely well formed. The regexp contains nested
// * quantifiers. That has been known to have extremely bad performance
// problems on some browsers for very long strings. A PATH is expected to be
// reasonably short. A PATH is allowed to belong to a very restricted subset of
// Goessner's JSONPath.

// So,
//      var s = '[{"$ref":"$"}]';
//      return JSON.retrocycle(JSON.parse(s));
// produces an array containing a single element which is the array itself.

  var px =
    /^\${1,4}(?:\[(?:\d+|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

  function redo (item) {
    if (typeof item == 'string' && item.charAt(0) == '\x10') {
      switch (item.charAt(1)) {
      case 's':
        return item.substr(2);
      case 'b':
        var bounds = item.substr(2).split(',', 2);
        return $$.slice(bounds[0] || 0, (bounds[0] || 0) + (bounds[1] || [0]));
      case 'd':
        return new Date(item.substr(2));
      case 'r':
        return decodeRegExp(item.substr(2));
      case 'e':
        return new Error(item.substr(2));
      case 'j':
        var path = item.substr(2);
        if (px.test(path)) {
          return eval(path);
        }
      default: return null;
      }
    }

    if (item && typeof item === 'object') {
      rez(item, $$);
    }
    return item;
  }

  function rez(value) {

// The rez function walks recursively through the object looking for $ref
// properties. When it finds one that has a value that is a path, then it
// replaces the $ref object with a reference to the value that is found by
// the path.

    var i, name;

    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (i = 0; i < value.length; i += 1) {
          value[i] = redo(value[i]);
        }
      } else {
        for (name in value) {
          value[name] = redo(value[name]);
        }
      }
    }
  }

  $ = redo($)

  return $;
};


// Public API

exports.serialize = function (object) {
  var objects = [],   // Keep a reference to each unique object or array
    paths = [],     // Keep the path to each unique object or array
    buffers = [];   // Returned buffers

  var nilbyte = new Buffer([0x00]);

  if (Buffer.isBuffer(object)) {
    return Buffer.concat([
      nilbyte,
      object
    ]);
  }

  var json = new Buffer(JSON.stringify(derez(object, '$', objects, paths, buffers)));
  if (buffers.length == 0) {
    return json;
  }

  return Buffer.concat([
    json,
    nilbyte,
    Buffer.concat(buffers)
  ]);
}

exports.deserialize = function (buf) {
  for (var i = 0; i <= buf.length; i++) {
    if (buf[i] == 0x00 || buf[i] == null) {
      break;
    }
  }
  var jsonbuf = buf.slice(0, i);
  var bufbuf = buf.slice(i + 1);

  // Shortcut for only encoding a root buffer. 
  if (jsonbuf.length == 0) {
    return bufbuf;
  }

  return rerez(JSON.parse(jsonbuf.toString('utf-8')), bufbuf);
}