'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('./src/core');

var _core2 = _interopRequireDefault(_core);

var _soundcloud = require('./src/adapters/soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.registerAdapter(_soundcloud2.default);

exports.default = _core2.default;