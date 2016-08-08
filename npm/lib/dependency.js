var M = require('./mod');
var Version = require('./version');

module.exports = Dependency;

function Dependency(name, constraint) {
  this.name = name;
  this.constraint = constraint;
  this.mod = undefined;
  this.bestVersion = undefined;
}
