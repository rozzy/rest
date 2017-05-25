'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.registerMethods = registerMethods;
exports.registerPatterns = registerPatterns;
exports.loadPatterns = loadPatterns;
exports.initializePattern = initializePattern;
exports.run = run;

var _core = require('lodash/core');

var _sequencer = require('./sequencer');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// registers given methods in the instance object
// then these methods could be executed in patterns
function registerMethods(methodsGenerator) {
  if (!(0, _core.isFunction)(methodsGenerator)) {
    throw new TypeError('Pass the function which returns an object with methods you want to register');
  }

  var methods = methodsGenerator.call(this, this.options, this);
  var isFunc = (0, _core.isFunction)(methods);

  if (!(0, _core.isObject)(methods) && !isFunc) {
    throw new TypeError('Please return an object or a named function from the "registerMethods" curry function');
  }

  if (isFunc && !methods.name) {
    throw new Error('Please return a named function from "registerMethods" to be able to call it from actions');
  }

  if (!this._methods) {
    this._methods = {};
  }

  if (isFunc) {
    this._methods[methods.name] = methods;
  } else {
    this._methods = Object.assign({}, this._methods, methods);
  }

  return this;
}

// registers patterns in the instance object
// then these patterns could be executed with .run method or from other patterns
function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns;
  } else if ((0, _core.isArray)(this._patterns)) {
    this._patterns = [].concat(_toConsumableArray(this._patterns), _toConsumableArray(patterns));
  }

  return this;
}

// checks given patterns and pass them to the .registerPatterns method
function loadPatterns(patternsGenerator) {
  var typeErrorString = 'Pass the function which returns a set of patterns to the "loadPatterns" method';
  if (!(0, _core.isFunction)(patternsGenerator)) {
    throw new TypeError(typeErrorString);
  }

  var patterns = patternsGenerator.call(this, this.options, this);
  if (!(0, _core.isArray)(patterns)) {
    throw new TypeError(typeErrorString);
  }

  registerPatterns.call(this, patterns);

  return this;
}

// checks if the pattern could be executed
// then passes it to the sequencer
function initializePattern(instance, givenPattern) {
  var pattern = (0, _sequencer.findPattern)(instance, givenPattern);

  return (0, _sequencer.executePattern)(instance, pattern);
}

// runs given pattern (array/string)
// accepts string - name of the pattern
// if string, it will look for a registered pattern with that name and try to execute it
//
// accepts array – in this case the pattern will be anonymous (anonymous pattern)
// anonymous pattern is a regular pattern, but it doesn't have a name and callbacks
// so it can not be reffered from other sequences
function run(pattern) {
  var _this = this;

  if (!this.runned) {
    this.runned = [];
  }

  this.runned.push({
    instance: this,
    at: +new Date(),
    with: pattern
  });

  var authorize = function authorize() {
    if (_this.options.authorization && !_this.options.authorization.manual) {
      _this.authorize();
    }
  };

  if (this.options.authorization) {
    this._onAuthorize = function () {
      initializePattern(_this, pattern);
    };

    return authorize(), this;
  } else {
    return initializePattern(this, pattern), this;
  }
}