const jsdom = require('jsdom');
const fs = require('fs');
const path = require('path');

const mermaid = fs.readFileSync(path.resolve(path.dirname(require.resolve('mermaid')) + '/../dist/mermaid.js'), 'UTF8');

var virtualConsole = jsdom.createVirtualConsole();
virtualConsole.on("jsdomError", function (error) {
  debugger;
  console.error(error.stack, error.detail);
});

jsdom.env({
  url: "http://news.ycombinator.com/",
  src: [mermaid],
  done(err, window) {
    if (err) { console.error(err); return; }
    debugger;

  }
});
