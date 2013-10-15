var colony = require('colony');
var wrench = require('wrench');
var fs = require('fs');

function gen (f) {
  fs.readFile(__dirname + '/../' + f, 'utf-8', function (err, file) {
    try {
      fs.writeFile(f.replace(/\.(js)$/i, '.lua'), colony.colonize(file), function (err) {
        // ...
      });
    } catch (e) {
      console.error('Error parsing ' + f, e);
    }
  })
}

wrench.readdirRecursive(__dirname + '/..', function (err, files) {
  if (!files) {
    console.log('[done preprocessing]');
    return;
  }
  files.filter(function (f) {
    return f.match(/\.(js)$/i) && (f.match(/^examples\/connect\//) || f.match(/^(builtin|etc)\//));
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