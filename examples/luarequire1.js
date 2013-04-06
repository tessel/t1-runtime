try {
	var json = require('dkjson')
	console.log(json.encode.call(['Success:', 'Called', 'a', 'native', 'Lua', 'library']))

	console.log(require('examples/luarequire2').apples)
} catch (e) { 
	console.log('Please run `luarocks install dkjson` before running.')
  console.log(e)
}
