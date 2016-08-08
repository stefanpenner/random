var RSVP = require('rsvp');
var https = require('https');
var Version = require('./version');

module.exports = M;
function M(name, info) {
  this.name = name;

  // TODO: local info cache
  this._info = info;
  this._versions = {};
}

M.prototype.versions = function() {
  var dep = this;
  return new RSVP.Promise(function(resolve){
    resolve(dep.info().then(function(a){
      return a.versions;
    }));
  });
};

M.prototype.version = function(version) {
  var m = this;
  if (m._versions[version]) {
    return RSVP.Promise.resolve(m._versions[version]);
  }

  return m.versions().then(function(versions) {
    if (version in versions) {
      return (m._versions[version] = new Version(m.name, version, versions[version]));
    }

    throw new Error('No such version: ' + version + ' for ' + dep.name);
  });
};

M.prototype.info = function() {
  var dep = this;
  return new RSVP.Promise(function(resolve, reject) {
    try {
      if (dep._info) {
        return resolve(dep._info);
      }
      var url = 'https://registry.npmjs.org/' + dep.name;
      console.log('get', url);
      https.get(url,  function(res) {
        var body = '';
        res.on('data', function(chunk) {
          body += chunk;
        });
        res.on('end', function() {
          try {
            var parsed = JSON.parse(body);
            dep._info  = parsed;
            resolve(parsed);
          } catch (e) {
            reject(e);
          }
        });
        res.on('error', function(error) {
          reject(error);
        });
      });
    } catch (e) {
      reject(e);
    }
  });
}
