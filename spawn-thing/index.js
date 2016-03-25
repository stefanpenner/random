var spawn = require('child_process').spawn;
var RSVP = require('rsvp');
// stream input
function exec(command, args) {
  return new RSVP.Promise(function(resolve, reject) {
    var data = '';
    var ls = spawn(command, args);

    ls.stdout.on('data', function(payload) {
      console.log(payload.toString());
      data += payload;
    });

    ls.stderr.on('data', function(reason) {
      console.error(reason);
      reject(reason);
    });

    ls.on('close', (code) => {
      resolve(data);
    });
  });
}

exec('sh', ['./foo.sh']).then(function(result) {
  console.log('done');
}).catch(function(reason) {
  console.error(reason);
  console.error(reason && reason.stack);
  process.exit(1);
});
