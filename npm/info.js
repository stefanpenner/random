var M = require('./lib/mod');
var m = new M('rsvp');
var RSVP = require('rsvp');

console.log(m.name);

m.version('3.2.1').then(function(a) {
  return a.ensureInstalled().then(function(a) {
    return a.dependencies().then(function(b) {
      debugger;
    });
  });
}).catch(function(b){
  console.error('error');
  console.error(b);
}).finally(function() {
  console.log('complete');
})
