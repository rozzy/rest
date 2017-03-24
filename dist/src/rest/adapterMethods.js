'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adapterIsValid = adapterIsValid;
function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain `authorize` method');
  }

  return true;
}