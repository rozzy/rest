'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isActionRegistered = isActionRegistered;
exports.checkSequenceAction = checkSequenceAction;
exports.checkPatternSequence = checkPatternSequence;
exports.checkPattern = checkPattern;
exports.checkAllPatterns = checkAllPatterns;
exports.registerPatterns = registerPatterns;
exports.registerMethods = registerMethods;
exports.loadPatterns = loadPatterns;
exports.run = run;

var _core = require('lodash/core');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isActionRegistered(action) {
  return !!this && !!this._methods && typeof action === 'string' && !!this._methods[action] && (0, _core.isFunction)(this._methods[action]);
}

function checkSequenceAction(action) {
  var isString = typeof action === 'string';
  var isFunc = (0, _core.isFunction)(action);

  if (!isFunc && !isString) {
    throw new TypeError('Sequence could only contain strings or functions');
  }

  if (!isFunc && !isActionRegistered.call(this, action)) {
    throw new Error('There is no registered action "' + action + '"');
  }

  return true;
}

function checkPatternSequence(sequence, context) {
  if (!sequence || !sequence.map) {
    throw new TypeError('"sequence" should be an array of sequences');
  }

  return sequence.map(checkSequenceAction.bind(context));
}

function checkPattern(pattern) {
  if (!(0, _core.isObject)(pattern)) {
    throw new TypeError('Pattern should be a plain object');
  }

  if (!pattern.hasOwnProperty('sequence')) {
    throw new TypeError('Pattern should contain the "sequence" property');
  }

  if (!(0, _core.isArray)(pattern.sequence)) {
    throw new TypeError('"Sequence" property should be an array of actions (see docs: sequence)');
  }

  checkPatternSequence(pattern.sequence, this);

  return true;
}

function checkAllPatterns(patterns, context) {
  return patterns.forEach(checkPattern.bind(context));
}

function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns;
  } else if ((0, _core.isArray)(this._patterns)) {
    this._patterns = [].concat(_toConsumableArray(this._patterns), _toConsumableArray(patterns));
  }
}

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

function loadPatterns(patternsGenerator) {
  var typeErrorString = 'Pass the function which returns a set of patterns to the "loadPatterns" method';
  if (!(0, _core.isFunction)(patternsGenerator)) {
    throw new TypeError(typeErrorString);
  }

  var patterns = patternsGenerator.call(this, this.options, this);
  if (!(0, _core.isArray)(patterns)) {
    throw new TypeError(typeErrorString);
  }

  // checkAllPatterns(patterns, this) TODO check patterns on run
  registerPatterns.call(this, patterns);

  return this;
}

function run(str) {
  this.runned = true;

  // checkAllPatterns(patterns, this) TODO check patterns on run
  if (this.options.authorization && !this.options.authorization.manual) {
    this.authorize();
  }
  // console.log(this)

  return this;
}