"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = run;
function run(str) {
  this.runned = true;

  console.log(this.adapters);

  return this;
}