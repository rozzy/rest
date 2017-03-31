'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adapterIsValid = adapterIsValid;
function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('name') || typeof adapter.name !== 'string') {
    return new Error('Adapter should contain the "name" property (string)');
  }

  if (!adapter.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain "authorize" method');
  }

  if (typeof adapter.authorize !== 'function') {
    return new TypeError('"authorize" method must be a function');
  }

  return true;
}