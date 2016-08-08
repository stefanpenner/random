var https = require('https');
var fs = require('fs-extra');
var RSVP = require('rsvp');
var quickTemp = require('quick-temp');
var tar = require('tar-fs')
var gunzip = require('gunzip-maybe');
var existsSync = require('exists-sync');

var tmp = quickTemp.makeOrRemake(this, 'staging');

fs.mkdirpSync('tarballs');
fs.mkdirpSync('registry');

module.exports = Version;
function Version(name, version, pkg) {
  this.name = name;
  this.version = version;
  this.isDownloading = false;
  this.isDownloaded  = existsSync(this.tarballPath);
  this.isInstalling  = false;
  this.isInstalled   = existsSync(this.installPath);
  this.pkg = pkg;
}

Object.defineProperty(Version.prototype, 'tarballPath', {
  get: function() {
    return 'tarballs/' + this.name + '-' + this.version + '.tgz';
  }
});

Object.defineProperty(Version.prototype, 'tmp', {
  get: function() {
    return tmp + '/' + this.name + '-' + this.version + '.tgz';
  }
});


Object.defineProperty(Version.prototype, 'url', {
  get: function() {
    return 'https://registry.npmjs.org/' + this.name + '/-/' + this.name + '-' + this.version + '.tgz';
  }
});


Object.defineProperty(Version.prototype, 'installPath', {
  get: function() {
    return 'registry/' + this.name + '@' + this.version;
  }
});

Version.prototype.uninstall = function() {
  var dep = this;
  return new RSVP.Promise(function(resolve, reject) {
    if (existsSync(this.installPath)) {
      fs.removeSync(this.installPath);
      fs.removeSync(this.tarballPath);
    } else {
      throw new Error('Attempting to uninstall: "' + dep.name + '" but it is not installed');
    }
  });
};

Version.prototype.ensureInstalled = function() {
  var dep = this;
  console.log('ensure installed');
  return new RSVP.Promise(function(resolve, reject) {
    if (dep.isInstalled) {
      resolve(dep);
    } else {
      resolve(dep.ensureDownloaded().then(function() {
        return dep.install();
      }));
    }
  });
};

Version.prototype.dependencies = function() {
  // TODO: async
  return this.pkg
    debugger;
  });
};

Version.prototype.install = function() {
  console.log('install', this.name, this.version);

  var dep = this;
  this.isInstalling = true;
  var tmpPath  = tmp + dep.installPath;

  return new RSVP.Promise(function(resolve, reject) {
    try {
      var stream = fs.createReadStream(dep.tarballPath).
        pipe(gunzip()).
        pipe(tar.extract(tmpPath));

      stream.on('finish', resolve);
      stream.on('error', reject);
    } catch(e) {
      reject(e);
    }
  }).then(function() {
    fs.removeSync(dep.installPath);
    fs.renameSync(tmpPath + '/package', dep.installPath);
  }).finally(function() {
    dep.isInstalling = false;
  }).then(function() {
    dep.isInstalled = true;
    return dep;
  });
};

Version.prototype.ensureDownloaded = function() {
  var dep = this;

  return new RSVP.Promise(function(resolve, reject) {
    if (dep.isDownloaded) {
      resolve(dep);
    } else {
      resolve(dep.download());
    }
  });
};

Version.prototype.download = function() {
  console.log('download', this.name, this.version);

  var dep = this;
  this.isDownloading = true;
  return new RSVP.Promise(function(resolve, reject) {
    var file = fs.createWriteStream(dep.tmp);
    var request = https.get(dep.url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        try {
          file.close(function() {
            try {
              fs.renameSync(dep.tmp, dep.tarballPath)
              resolve(dep);
            } catch (e) {
              reject(e);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', function(err) { // Handle errors
      try {
        fs.unlinkSync(dest); // Delete the file async. (But we don't check the result)
        reject(err);
      } catch(e) {
        reject(e);
      }
    });
  }).finally(function() {
    this.isDownloading = false;
  });
};
