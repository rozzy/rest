'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _core = require('../src/core');

var _core2 = _interopRequireDefault(_core);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Testing adapters:', function () {
  describe('rest.registerAdapter()', function () {
    describe('should pass', function () {
      it('when passing a proper authorize function and name', function () {
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return {
              name: 'testAdapter',
              authorize: function authorize() {
                console.log('authorized');
              }
            };
          });
        };

        _assert2.default.doesNotThrow(executable, Error);
      });
    });

    it('should add a new adapter to the list of all adapters', function () {
      var newAdapter = {
        name: 'testAdapter2',
        authorize: function authorize() {
          console.log('authorized');
        }
      };

      _core2.default.registerAdapter(function () {
        return newAdapter;
      });

      _assert2.default.notEqual(_core2.default.adapters.indexOf(newAdapter), -1);
    });

    describe('should throw an error', function () {
      it('when passing not a function', function () {
        var executable = _core2.default.registerAdapter;

        _assert2.default.throws(executable, /Adapter must be a function/);
      });

      it('when passing an empty function', function () {
        var executable = function executable() {
          _core2.default.registerAdapter(function () {});
        };

        _assert2.default.throws(executable, /Adapter must return a valid object/);
      });

      it('when there is no `authorize` method in adapter constructor', function () {
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return { name: 'test' };
          });
        };

        _assert2.default.throws(executable, /Adapter should contain "authorize" method/);
      });

      it('when there is no `name` specified', function () {
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return {
              authorize: function authorize() {}
            };
          });
        };

        _assert2.default.throws(executable, /Adapter should contain the "name" property/);
      });
    });

    describe('should not add a new adapter to the list of all adapters, ', function () {
      it('if there is no name specified', function () {
        var brokenAdapter = {
          authorize: function authorize() {}
        };
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return brokenAdapter;
          });
        };

        _assert2.default.throws(executable, /Adapter should contain the "name" property/);
        _assert2.default.equal(_core2.default.adapters.indexOf(brokenAdapter), -1);
      });

      it('if there is no authorize method', function () {
        var brokenAdapter = { name: 'brokenAdapter1' };
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return brokenAdapter;
          });
        };

        _assert2.default.throws(executable, /Adapter should contain "authorize" method/);
        _assert2.default.equal(_core2.default.adapters.indexOf(brokenAdapter), -1);
      });

      it('if the authorize method is not executable', function () {
        var brokenAdapter = { name: 'brokenAdapter2', authorize: undefined };
        var executable = function executable() {
          _core2.default.registerAdapter(function () {
            return brokenAdapter;
          });
        };

        _assert2.default.throws(executable, /"authorize" method must be a function/);
        _assert2.default.equal(_core2.default.adapters.indexOf(brokenAdapter), -1);
      });
    });
  });
});