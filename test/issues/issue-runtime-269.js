var o = { foo: 1 };
var descriptor = Object.getOwnPropertyDescriptor(o, 'foo');
var fields = [ 'writable', 'enumerable', 'configurable' ];
var result = true;

for (var i = 0; i < fields.length; i++) {
  if (!(result = fields[i] in descriptor)) {
    break;
  }
}
console.log(result ? 'ok' : 'not ok');
