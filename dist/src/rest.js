'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _instanceMethods = require('./rest/instanceMethods');

var _adapterMethods = require('./rest/adapterMethods');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function () {
  var rest = {}; // global instance of rest
  rest.adapters = []; // list of all available adapters

  var defaultSettings = { // default rest settings
    adapter: 'custom', // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    credentials: null, // @object: authorization data for adapter API
    limits: null };

  /*
    registerAdapter
    should be called before rest.new method
    allows to register a new API adapter
    returns global rest object to chain methods
  */
  rest.registerAdapter = function (adapter) {
    if (!adapter || typeof adapter !== 'function') {
      throw new TypeError('Adapter must be a function');
    }

    var constructedAdapter = adapter(rest);

    if (!constructedAdapter || (typeof constructedAdapter === 'undefined' ? 'undefined' : _typeof(constructedAdapter)) !== 'object') {
      throw new TypeError('Adapter must return a valid object');
    }

    var adapterError = void 0;
    if (!(adapterError = (0, _adapterMethods.adapterIsValid)(constructedAdapter))) {
      throw adapterError;
    }

    rest.adapters = [].concat(_toConsumableArray(rest.adapters), [constructedAdapter]);

    return rest;
  };

  /*
    new
    creates a new instance of the middleware with specified settings
    returns a new instance
  */
  rest.new = function (instanceSettings) {
    var instance = {
      adapters: rest.adapters,

      run: _instanceMethods.run
    };

    instance.options = Object.assign({}, defaultSettings, instanceSettings);

    return instance;
  };

  return rest;
}();