'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.adapterIsValid = adapterIsValid;
exports.findAdapter = findAdapter;
exports.useAdapter = useAdapter;

var _lodash = require('lodash');

function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('name') || typeof adapter.name !== 'string') {
    return new Error('Adapter should contain the "name" property (string)');
  }

  if (!adapter.methods) {
    return new Error('Adapter should contain "methods" object');
  }

  if (!adapter.methods.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain "authorize" method');
  }

  if (typeof adapter.methods.authorize !== 'function') {
    return new TypeError('"authorize" method must be a function');
  }

  return true;
}

function findAdapter(adapters, adapterName) {
  if (!adapters) {
    throw new Error('There are no registered adapters');
  }

  if (!adapterName) {
    throw new Error('Pass an adapter name to the "findAdapter" method');
  }

  var foundAdapterInArray = adapters.find(function (adapter) {
    return adapter.name === adapterName;
  });

  if (!foundAdapterInArray) {
    throw new Error('There is no adapter registered with the name "' + adapterName + '"');
  }

  return foundAdapterInArray;
}

function useAdapter(adapterName) {
  if (!adapterName) {
    throw new Error('Pass an adapter name to the "useAdapter" method');
  }

  var adapter = findAdapter(this.adapters, adapterName);

  this._adapter = adapter;

  if (adapter.authorization) {
    this.options.authorization = (0, _lodash.merge)({}, adapter.authorization, this.options.authorization);
  }

  if (adapter.methods) {
    if (!this._methods) {
      this._methods = {};
    }

    this._methods = (0, _lodash.merge)({}, this._methods, adapter.methods);
  }

  return this;
}