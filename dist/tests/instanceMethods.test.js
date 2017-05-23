'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _core = require('../src/core');

var _core2 = _interopRequireDefault(_core);

var _instanceMethods = require('../src/rest/instanceMethods');

var _adapterMethods = require('../src/rest/adapterMethods');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var existingAdapter = {
  name: 'soundcloud',
  methods: {
    authorize: function authorize() {}
  }
};

_core2.default.registerAdapter(function (restSettings) {
  return existingAdapter;
});

describe('Testing instance methods:', function () {
  describe('instance.findAdapter()', function () {
    var instance = _core2.default.new({
      adapter: existingAdapter.name
    });

    describe('it should pass', function () {
      it('when passing the name of an existing adapter', function () {
        var executable = function executable() {
          (0, _adapterMethods.findAdapter)(instance.adapters, existingAdapter.name);
        };

        _assert2.default.doesNotThrow(executable, Error);
      });
    });

    describe('it should throw an error', function () {
      it('when passing no name argument', function () {
        var executable = function executable() {
          (0, _adapterMethods.findAdapter)(instance.adapters);
        };

        _assert2.default.throws(executable, /Pass an adapter name to the "findAdapter" method/);
      });

      it('when passing not registered adapter name', function () {
        var executable = function executable() {
          (0, _adapterMethods.findAdapter)(instance.adapters, 'custom');
        };

        _assert2.default.throws(executable, /There is no adapter registered with the name/);
      });

      it('when passing empty adapters list', function () {
        var executable = function executable() {
          (0, _adapterMethods.findAdapter)(undefined, 'custom');
        };

        _assert2.default.throws(executable, /There are no registered adapters/);
      });
    });
  });

  describe('instance.useAdapter()', function () {
    var instance = _core2.default.new({
      adapter: existingAdapter.name
    });

    describe('it should pass', function () {
      it('when trying to use existing adapter', function () {
        var executable = function executable() {
          _adapterMethods.useAdapter.call(instance, existingAdapter.name);
        };

        _assert2.default.doesNotThrow(executable, Error);
      });

      it('when checking the adapter name of the instance and it equals to the adapter we\'ve chosen', function () {
        _assert2.default.equal(instance._adapter.name, existingAdapter.name);
      });
    });

    describe('it should throw an error', function () {
      it('when trying to use not registered adapter name', function () {
        var executable = function executable() {
          _adapterMethods.useAdapter.call(instance, 'custom');
        };

        _assert2.default.throws(executable, /There is no adapter registered with the name/);
      });

      it('when passing no argument', function () {
        var executable = function executable() {
          _adapterMethods.useAdapter.call(instance);
        };

        _assert2.default.throws(executable, /Pass an adapter name to the "useAdapter" method/);
      });
    });
  });

  describe('private isActionRegistered', function () {
    var instance = _core2.default.new({
      adapter: existingAdapter.name
    });

    instance.registerMethods(function (restSettings) {
      return function someRegisteredMethod() {
        return true;
      };
    });

    describe('it should return true', function () {
      it('when passing a method that exists in instance._methods array', function () {
        var result = _instanceMethods.isActionRegistered.call(instance, 'someRegisteredMethod');

        _assert2.default.ok(result);
      });
    });

    describe('it should return false', function () {
      it('when passing no argument', function () {
        var result = _instanceMethods.isActionRegistered.call(instance);

        _assert2.default.equal(result, false);
      });

      it('when passing non existing method', function () {
        var result = _instanceMethods.isActionRegistered.call(instance, 'randomMethodName');

        _assert2.default.equal(result, false);
      });

      it('when passing not a string', function () {
        var boolResult = _instanceMethods.isActionRegistered.call(instance, true);
        var objectResult = _instanceMethods.isActionRegistered.call(instance, {});
        var funcResult = _instanceMethods.isActionRegistered.call(instance, function () {});
        var numberResult = _instanceMethods.isActionRegistered.call(instance, 10);
        var arrayResult = _instanceMethods.isActionRegistered.call(instance, []);
        var nullResult = _instanceMethods.isActionRegistered.call(instance, null);
        var nanResult = _instanceMethods.isActionRegistered.call(instance, NaN);

        _assert2.default.equal(funcResult, false);
        _assert2.default.equal(numberResult, false);
        _assert2.default.equal(boolResult, false);
        _assert2.default.equal(objectResult, false);
        _assert2.default.equal(arrayResult, false);
        _assert2.default.equal(nullResult, false);
        _assert2.default.equal(nanResult, false);
      });
    });
  });

  describe('private checkSequenceAction', function () {
    var instance = _core2.default.new({
      adapter: existingAdapter.name
    });

    instance.registerMethods(function (restSettings) {
      return function someRegisteredMethod() {
        return true;
      };
    });

    describe('it should return true', function () {
      it('when passing an anonymous function', function () {
        var executable = function executable() {
          return _instanceMethods.checkSequenceAction.call(instance, function (restSettings) {});
        };

        _assert2.default.doesNotThrow(executable, Error);
        _assert2.default.ok(executable());
      });

      it('when passing an existing method name', function () {
        var executable = function executable() {
          return _instanceMethods.checkSequenceAction.call(instance, 'someRegisteredMethod');
        };

        _assert2.default.doesNotThrow(executable, Error);
        _assert2.default.ok(executable());
      });
    });

    describe('it should throw an error', function () {
      it('when passing no argument', function () {
        var executable = function executable() {
          return _instanceMethods.checkSequenceAction.call(instance);
        };

        _assert2.default.throws(executable, /Sequence could only contain strings or functions/);
      });

      it('when passing not a string and not a function', function () {
        var executableArray = function executableArray() {
          return _instanceMethods.checkSequenceAction.call(instance, []);
        };
        var executableObject = function executableObject() {
          return _instanceMethods.checkSequenceAction.call(instance, {});
        };
        var executableNull = function executableNull() {
          return _instanceMethods.checkSequenceAction.call(instance, null);
        };
        var executableNumber = function executableNumber() {
          return _instanceMethods.checkSequenceAction.call(instance, 12);
        };
        var executableBoolean = function executableBoolean() {
          return _instanceMethods.checkSequenceAction.call(instance, true);
        };
        var executableNaN = function executableNaN() {
          return _instanceMethods.checkSequenceAction.call(instance, NaN);
        };

        var error = /Sequence could only contain strings or functions/;

        _assert2.default.throws(executableArray, error);
        _assert2.default.throws(executableObject, error);
        _assert2.default.throws(executableNull, error);
        _assert2.default.throws(executableNumber, error);
        _assert2.default.throws(executableBoolean, error);
        _assert2.default.throws(executableNaN, error);
      });

      it('when passing a method that doesn\'t exist', function () {
        var executable = function executable() {
          return _instanceMethods.checkSequenceAction.call(instance, 'someRandomMethod');
        };

        _assert2.default.throws(executable, /There is no registered action/);
      });
    });
  });

  describe('private checkPatternSequence', function () {
    var patterns = [{ name: 'test', sequence: ['someRegisteredMethod'] }];
    var instance = _core2.default.new({
      adapter: existingAdapter.name
    });

    instance.registerMethods(function (restSettings) {
      return function someRegisteredMethod() {
        return true;
      };
    }).loadPatterns(function (restSettings) {
      return patterns;
    });

    describe('it should pass', function () {
      it('when array of existing actions passed', function () {
        var executable = function executable() {
          (0, _instanceMethods.checkPatternSequence)(patterns[0].sequence, instance);
        };

        _assert2.default.doesNotThrow(executable, Error);
      });
    });

    describe('it should throw an error', function () {
      it('when there is no sequence passed', function () {
        var executable = function executable() {
          (0, _instanceMethods.checkPatternSequence)(undefined, instance);
        };

        _assert2.default.throws(executable, /"sequence" should be an array of sequences/);
      });

      it('when the sequence is not an array', function () {
        var executable = function executable(subject) {
          return function () {
            (0, _instanceMethods.checkPatternSequence)(subject, instance);
          };
        };

        [12, null, NaN, true, {}, 'test'].forEach(function (subject) {
          _assert2.default.throws(executable(subject), /"sequence" should be an array of sequences/);
        });
      });
    });
  });
});