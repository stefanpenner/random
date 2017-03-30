const fs = require('fs');
const path = require('path');

const mermaid = fs.readFileSync(path.resolve(path.dirname(require.resolve('mermaid')) + '/../dist/mermaid.js'), 'UTF8');
// returns a window with a document and an svg root node
const window   = require('svgdom')
const self = window;
const global = self;
const SVGElement = require('svgdom/class/node').SVGElement;

// SVGElement.prototype.getTransformToElement = SVGElement.prototype.getTransformToElement || function(elem) {
    // return elem.getScreenCTM().inverse().multiply(this.getScreenCTM());
// };
const SVG      = require('svg.js')(window)
const document = window.document
const name = "OMG"
window.console = {
  debug() { },
  log() { }
};

eval(mermaid);
debugger;
var graphDefinition = 'graph TB\na-->b';
var cb = function(svgGraph){
  debugger;
    console.log(svgGraph);
};
debugger;
self.mermaidAPI.render('id1',graphDefinition,cb);
debugger;
// or
