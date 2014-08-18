var tap = require('../tap');

tap.count(29);

var fs = require('fs');
var util = require('util');

tap.ok(Buffer.isBuffer(fs.readFileSync(__dirname + '/files_fs/hello.txt')), 'fs.readFileSync is buffer')
tap.ok(typeof fs.readFileSync(__dirname + '/files_fs/hello.txt', 'utf-8') == 'string', 'fs.readFileSync accepts encoding')
tap.ok(util.isArray(fs.readdirSync(__dirname + '/files_fs/')), 'fs.readdirSync is array')
// tap.ok(fs.readdirSync(__dirname).indexOf('node_modules') > -1, '# TODO node_modules should exist?');

var output = __dirname + '/files_fs/output.txt';
var output2 = __dirname + '/files_fs/output2.txt';

var peeped = 'YOU MIGHT THINK YOUVE PEEPED THE SCENE\n', havent = 'YOU HAVENT\n';
fs.writeFileSync(output, peeped);
tap.ok(fs.readFileSync(output, 'utf-8') == peeped, 'writeFileSync == readFileSync of same file');
fs.appendFileSync(output, havent);
tap.ok(fs.readFileSync(output, 'utf-8') == peeped + havent, 'appendFileSync works');

tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('output.txt') > -1, 'written file exists in readdirSync');
tap.ok(fs.existsSync(output) == true, 'written file exists');
fs.unlinkSync(output)
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('output.txt') == -1, 'unlinked file no longer in readdirSync');
tap.ok(fs.existsSync(output) == false, 'deleted file no longer exists');

fs.writeFileSync(output, 'THE WATERED DOWN ONE, THE ONE YOU KNOW\n');
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('output.txt') > -1, 'written file exists in readdirSync...');
fs.renameSync(output, output2);
tap.ok(fs.existsSync(output) == false, 'renamed file doesnt still exist');
tap.ok(fs.existsSync(output2) == true, 'but under its new name does');
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('output2.txt') > -1, 'and is in new position');
fs.unlinkSync(output2);

var centuries = 'WAS MADE UP CENTURIES AGO\n';
fs.writeFileSync(output, centuries);
tap.ok(fs.readFileSync(output).length == centuries.length, 'file length matches writeFileSync');
fs.truncateSync(output);
tap.ok(fs.readFileSync(output).length == 0, 'truncated file length is 0');
fs.unlinkSync(output);

// make and delete a directory
var dir = __dirname + '/files_fs/theymadeitsound';
var dirchild = __dirname + '/files_fs/theymadeitsound/allwackandcorny';
console.log('# mkdir');
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('theymadeitsound') == -1, 'mkdir before is missing');
fs.mkdirSync(dir);
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('theymadeitsound') > -1, 'mkdir after is there');
try {
	fs.unlinkSync(dir);
	tap.ok(false, 'you should not be able to unlink dir')
} catch (e) {
	tap.ok(true, 'cannot unlink dir')
}
fs.writeFileSync(dirchild, 'YES ITS AWFUL BLASTED BORING\n');
tap.ok(fs.readdirSync(dir).indexOf('allwackandcorny') > -1, 'mkdir inside mkdir works');
try {
	fs.rmdirSync(dir);
	tap.ok(false, 'you should not be able to remove non-empty dir')
} catch (e) {
	tap.ok(true, 'cannot rmdir non-empty dir')
}
fs.unlinkSync(dirchild);
tap.ok(fs.readdirSync(dir).indexOf('allwackandcorny') == -1, 'child dir file can be unlinked');
fs.rmdirSync(dir);
tap.ok(fs.readdirSync(__dirname + '/files_fs').indexOf('theymadeitsound') == -1, 'delete dir after empty');
console.log('');

// stats
console.log('# stats');
var twisted = 'TWISTED FICTION\n';
fs.writeFileSync(output, twisted);
var stat = fs.statSync(output);
tap.ok(stat.size == twisted.length, 'filesize of written file is correct');
console.log('#', stat.size, twisted.length)
tap.ok(stat.isFile() == true, 'file isFile');
tap.ok(stat.isDirectory() == false, 'file isDirectory');
var stat = fs.statSync(__dirname + '/files_fs/');
tap.ok(stat.isFile() == false, 'dir isFile')
tap.ok(stat.isDirectory() == true, 'dir isDirectory');
fs.unlinkSync(output);
console.log('');


setImmediate(function () {
	var sick = 'SICK ADDICTION';
	fs.writeFileSync(output, sick);
	fs.readFile(output, 'utf-8', function (err, str) {
		tap.ok(str == sick, 'readFile is async and works');
		fs.unlinkSync(output);
		fs.readFile(output, 'utf-8', function (err, str) {
			tap.ok(err, 'readFile can return (not throw) err');
		});
	})
})
