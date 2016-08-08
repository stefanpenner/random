var Module = require('module');
var original = Module._resolveFilename;

var MAP = {
  'rsvp': '/Users/stefanepenner/src/tildeio/rsvp.js/dist/lib/rsvp.js'
}
Module._resolveFilename = function(a, b, c) {
  if (MAP[a]) {
    console.log('hit');
    return MAP[a];
  } else {
    console.log('mis');
    // if (NativeModule.nonInternalExists(request)) {
    //   return request;
    // }
    var b = original.apply(this, arguments);
    console.log(b);
    return b;
  }
}

require('rsvp');
debugger;


