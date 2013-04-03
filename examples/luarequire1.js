try {
	var json = require('dkjson')
	print(json.encode.call(['Success:', 'Called', 'a', 'native', 'Lua', 'library']))

	print(require('demo/luarequire2').apples)
} catch (e) { 
	print('Please run `luarocks install dkjson` before running.')
print(e)
}
