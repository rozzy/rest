'use strict';

var _core = require('./src/core');

var _core2 = _interopRequireDefault(_core);

var _soundcloud = require('./src/adapters/soundcloud');

var _soundcloud2 = _interopRequireDefault(_soundcloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.registerAdapter(_soundcloud2.default);

var bot = _core2.default.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  threads: 1,
  authorization: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectURI: 'http://localhost:8000/authorize'
  },
  limits: {
    callsPerPeriod: 15000,
    period: 86400
  }
});

bot.registerMethods(function (restSettings, instance) {
  return function testmethods() {
    return true;
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
  return [{
    name: 'main',
    sequence: [':explore', function (prevResolution, index, done) {
      if (prevResolution === true) {
        return ':listenToNewTracks';
      } else {
        return false;
      }
    }, function (prevResolution, index, done, sequencer) {
      if (prevResolution === true) return sequencer.repeat();
    }]
  }, {
    name: 'explore',
    sequence: ['chooseCriterias', 'findTrackToStartExplore', 'collectExploreData']
  }];
}).registerMethods(function (restSettings, instance) {
  return {
    chooseCriterias: function chooseCriterias(prevResolution, index, done) {
      console.log('chooseCriterias ...', prevResolution, index);
      setTimeout(done, 1000);
    }
  };
}).run();