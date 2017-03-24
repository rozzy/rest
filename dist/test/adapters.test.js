'use strict';

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('Checking adapters', function () {
  describe('register adapters', function () {
    it('should throw an error when passing not function', function (done) {
      _assert2.default.deepEqual({ a: 1 }, { a: '1' });
    });
  });
});