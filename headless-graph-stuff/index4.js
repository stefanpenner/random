var D3Node = require('d3-node');
var d3 = require ('d3');
var d3n = new D3Node();
d3.select(d3n.document.body).append('span') // select <body> & insert span
console.log(d3n.html()) // returns: <html><head></head><body><span></span></body></html>
