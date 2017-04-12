'use strict';

var _core = require('./src/core');

var _core2 = _interopRequireDefault(_core);

var _soundcloud = require('./src/adapters/soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

var _credits = require('./credits');

var _credits2 = _interopRequireDefault(_credits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.registerAdapter(_soundcloud2.default);

var bot = _core2.default.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  threads: 1,
  authorization: {
    clientId: _credits2.default.sc.CLIENT_ID,
    clientSecret: _credits2.default.sc.CLIENT_SECRET,
    redirectURI: 'http://localhost:8080/callback.html'
  },
  limits: {
    callsPerPeriod: 15000,
    period: 86400
  }
});

bot.registerMethods(function (restSettings, instance) {
  return function authorize() {
    // example of calling super method from the adapter
    this._adapter.methods.authorize.apply(this, arguments);
  };
}).registerMethods(function (restSettings, instance) {
  return {
    listenNext: function listenNext(prevResolution, index, done) {
      if (instance.data.loaded <= instance.data.available) {
        return ['loadNext', 'listenNext'];
      } else {
        var track = foundNextTrack(instance);
        listenToTheTrack(track);

        return true;
      }
    }
  };
}).loadPatterns(function (restSettings, instance) {
  return [
  // {
  //   name: 'main',
  //   sequence: [
  //     ':explore',
  //     (prevResolution, index, done) => {
  //       if (prevResolution === true) {
  //         return ':listenToNewTracks'
  //       } else {
  //         return false
  //       }
  //     },
  //     (prevResolution, index, done, sequencer) => {
  //       if (prevResolution === true) return sequencer.repeat()
  //     }
  //   ]
  // },
  {
    name: 'explore',
    sequence: ['listenNext']
  }];
}).registerMethods(function (restSettings, instance) {
  return {
    chooseCriterias: function chooseCriterias(prevResolution, index, done) {
      console.log('chooseCriterias ...', prevResolution, index);
      setTimeout(done, 1000);
    }
  };
}).run();