var colony = require('colony');
var wrench = require('wrench');
var fs = require('fs');
var path = require('path');

var root = path.join(__dirname + '/../', (process.argv[2] || '')) + '/';

console.log(root);

function gen (f) {
  fs.readFile(root + f, 'utf-8', function (err, file) {
    try {
      fs.writeFile(root + f.replace(/\.(js)$/i, '.colony').replace(/\/([^\/]+)$|^/, '/~$1'), colony.colonize(file), function (err) {
        // ...
      });
    } catch (e) {
      console.error('Error parsing ' + f, e);
    }
  })
}

wrench.readdirRecursive(root, function (err, files) {
  if (!files) {
    console.error('[done preprocessing]');
    return;
  }
  files.filter(function (f) {
    return f.match(/\.(js)$/i) // && (f.match(/^examples\/http\//) || f.match(/^(builtin|test)\//));
  }).forEach(function (f) {
    gen(f);
  });
});

// args.demand(1).argv;

//       try {
//         var file = argv._[0];
//         if (!fs.existsSync(file) && fs.existsSync(file + '.js')) {
//           file = file + '.js';
//         }
//         var src = fs.readFileSync(file, 'utf-8');
//         var luacode = colony.colonize(src);
//       } catch (e) {
//         console.error(String(e.stack).red);
//         process.exit(100);
//       }

//       cli_run(luacode);