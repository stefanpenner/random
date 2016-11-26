var fs = require('fs');
var rimraf = require('rimraf')

function symlinkSync(target, path) {
  console.log('symlink', target, ' -> ', path);
  fs.symlinkSync(target, path);
}

var originalSymlinkSync = fs.symlinkSync;

// uncomment to make pass in Bash on Ubuntu on Windows
// fs.symlinkSync = function(source, target, options) {
//   originalSymlinkSync.call(fs, source.replace(/\/$/g,''), target, options);
// }

rimraf.sync('out'); // setup
fs.mkdirSync('out'); // cleanup

fs.mkdirSync('out/foo');
fs.writeFileSync('out/foo/bar.txt', 'hi');

symlinkSync(fs.realpathSync('out/foo/'), 'out/bar');
symlinkSync(fs.realpathSync('out/bar/') + '/', 'out/baz');

console.log('out/foo/bar.txt', fs.readFileSync('out/foo/bar.txt', 'UTF8'));
console.log('out/bar/bar.txt', fs.readFileSync('out/bar/bar.txt', 'UTF8'));
console.log('out/baz/bar.txt', fs.readFileSync('out/baz/bar.txt', 'UTF8'));
