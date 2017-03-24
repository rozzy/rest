'use strict';

var _core = require('./src/core');

var _core2 = _interopRequireDefault(_core);

var _soundcloud = require('./src/adapters/soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.registerAdapter(_soundcloud2.default);

var bot = _core2.default.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  // adapter: 'custom',
  // adapterSettings: {
  //   name: ''
  // }
  threads: 1,
  credentials: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectURI: 'http://localhost:8000/authorize'
  },
  limits: {
    callsPerPeriod: 15000,
    period: 86400
  }
});

bot.run();