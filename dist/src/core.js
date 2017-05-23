'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _instanceMethods = require('./rest/instanceMethods');

var _adapterMethods = require('./rest/adapterMethods');

var _auth = require('./rest/auth');

var _auth2 = _interopRequireDefault(_auth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

exports.default = function () {
  var defaultSettings = { // default rest settings
    adapter: 'custom', // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    authorization: { // @object: authorization data for adapter API
      manual: false // @bool: tries to authorize on start, when true
    },
    limits: null };

  var rest = {}; // global instance of rest
  rest.adapters = []; // list of all available adapters

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

    var adapterContainsErrors = _adapterMethods.adapterIsValid.call(rest, constructedAdapter);
    if (adapterContainsErrors instanceof Error) {
      throw adapterContainsErrors;
    }

    rest.adapters = [].concat(_toConsumableArray(rest.adapters), [constructedAdapter]);

    return rest;
  };

  /*
    new
    creates a new instance of the middleware with specified settings
    returns the instance
  */
  rest.new = function (instanceSettings) {
    var instance = {
      adapters: rest.adapters,
      _methods: {},

      run: _instanceMethods.run, useAdapter: _adapterMethods.useAdapter, loadPatterns: _instanceMethods.loadPatterns, registerMethods: _instanceMethods.registerMethods, isMethodRegistered: _instanceMethods.isMethodRegistered
    };

    // extending with authorization module
    instance = Object.assign({}, instance, _auth2.default);
    instance.options = Object.assign({}, defaultSettings, instanceSettings);

    instance.useAdapter(instanceSettings.adapter);

    return instance;
  };

  return rest;
}();