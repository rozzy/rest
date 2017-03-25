'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _core = require('../src/core');

var _core2 = _interopRequireDefault(_core);

var _soundcloud = require('../src/adapters/soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Checking adapters:', function () {
  describe('rest.registerAdapter()', function () {
    it('should throw an error when passing not a function', function () {
      var executable = _core2.default.registerAdapter;

      _assert2.default.throws(executable, TypeError);
    });

    it('should throw an error when passing an empty function', function () {
      var executable = function executable() {
        _core2.default.registerAdapter(function () {});
      };

      _assert2.default.throws(executable, TypeError);
    });

    it('should throw an error when there is no `authorize` method in adapter constructor', function () {
      var executable = function executable() {
        _core2.default.registerAdapter(function () {
          return {};
        });
      };

      _assert2.default.throws(executable, Error);
    });

    it('should not add a new adapter to the list of all adapters, if there are any errors', function () {
      var brokenAdapter = { name: 'brokenAdapter1' };
      var executable = function executable() {
        _core2.default.registerAdapter(function () {
          return brokenAdapter;
        });
      };

      _assert2.default.throws(executable, Error);
      _assert2.default.equal(_core2.default.adapters.indexOf(brokenAdapter), -1);
    });

    it('should execute without any errors when passing proper function', function () {
      var executable = function executable() {
        _core2.default.registerAdapter(function () {
          return {
            name: 'testAdapter',
            authorize: function authorize() {
              return console.log('authorized');
            }
          };
        });
      };

      _assert2.default.doesNotThrow(executable, Error);
    });

    it('should add a new adapter to the list of all adapters', function () {
      var newAdapter = {
        name: 'testAdapter2',
        authorize: function authorize() {
          return console.log('authorized');
        }
      };

      _core2.default.registerAdapter(function () {
        return newAdapter;
      });

      _assert2.default.notEqual(_core2.default.adapters.indexOf(newAdapter), -1);
    });
  });
});