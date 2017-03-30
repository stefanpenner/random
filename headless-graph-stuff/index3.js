const jsdom = require('jsdom');
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

// create svg.js instance
const draw = SVG(document.documentElement)

// use svg.js as normal
draw.rect(100,100).fill('yellow').move(50,50)

eval(mermaid);
// get your svg as string
console.log(draw.svg())
debugger;
// or
