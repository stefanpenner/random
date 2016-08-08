var Version = require('./lib/version');
var dep = new Version('rsvp', '3.2.1');

dep.ensureInstalled('rsvp', '3.2.1').
catch(function(e) {
  console.error('fail');
  console.error(e);
}).
finally(function() {
  console.log('complete');
});

