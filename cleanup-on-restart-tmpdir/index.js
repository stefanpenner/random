var createDirSync = require('mktemp').createDirSync;
var PID = process.pid;
var fs = require('fs');
var tmpdir = process.env.HOME + '/.tmp/node_tmpdirs';
var mkdirp = require('mkdirp');
var PIDFILE = tmpdir + '/' + PID;
var OS_TMPDIR = require('os').tmpdir();
var rimraf = require('rimraf');
var mv = require('mv');
var DIRS = []; // should be global

console.log('starting');

console.log('creating tmpdir');
mkdirp.sync(tmpdir);
console.log('create process file');

cleanupExisting();
fs.writeFileSync(PIDFILE, Date.now());

// only doit once per process
if (!process['cleanup_on_restart_tmpdir']) {
  process.on('exit', function() {
    console.log('onExit');
    fs.unlinkSync(PIDFILE); // inform the world we are dead/dying
    try {
      cleanupExisting();
      fs.unlinkSync(PIDFILE + '.paths');
    } catch(e) {
      console.log('cleanup failed');
      console.error(e);
      console.error(e.stack);
    }
  });
  process['cleanup_on_restart_tmpdir'] = DIRS;
}


function append(dir) {
  DIRS.push(dir);
  console.log('append to', PIDFILE + '.paths');
  fs.appendFileSync(PIDFILE + '.paths', dir +"\n");
}

// /tmp/node_tmpdirs/pid
// /tmp/node_tmpdirs/pid.logs

function createTmp(base, tmpDirName) {
  var dir = process.cwd() + '/' + createDirSync('omasdf-XXXX');
  console.log('appending');
  append(dir);
}

function cleanupExisting() {
  var stuff = fs.readdirSync(tmpdir);
  var paths = stuff.filter(function(file) {
    return /\.paths$/.test(file);
  });

  var pids = stuff.filter(function(file) {
    return /\d+$/.test(file);
  });

  console.log('paths', paths);
  console.log('pids', pids);

  var pathsToCleanup = paths.filter(function(path) {
    return path.split('.')[0] !== PID
  });

  console.log('cleanup', pathsToCleanup);

  var paths = pathsToCleanup.map(function(path) {
    return { path: tmpdir + '/' + path, paths: fs.readFileSync(tmpdir + '/' + path, 'UTF8') };
  });

  cleanup(paths.map(function(path) { return path.paths.split('\n'); }));
  cleanup(DIRS);
}

function flatten(input) {
  return input.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}

function cleanup(files) {
  flatten(files).forEach(function(file) {
    if (!file) { return }
    var newPath = OS_TMPDIR + file.split('/').join('_!_');
    console.log('moving', file, newPath);
    try {
      try {
      fs.renameSync(file, newPath);
      } catch(e) {
        // we should detect that the rename has already occured and skip it
      }
      rimraf(newPath); // actually wait for this to complete;
    } catch (e) {
      console.log('move failed');
    }
    console.log('moved');
  });
}

console.log('createTmp');
createTmp();
console.log('createTmp');
createTmp();
fs.unlinkSync('uknonwnfile');
throw 'OMG'
console.log('done');
