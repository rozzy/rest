'use strict';

var _rest = require('./src/rest');

var _rest2 = _interopRequireDefault(_rest);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

_rest2.default.registerAdapter('test');

var bot = _rest2.default.new({
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