'use strict';

var _index = require('../../../index');

var _index2 = _interopRequireDefault(_index);

var _credits = require('../../../credits');

var _credits2 = _interopRequireDefault(_credits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var bot = _index2.default.new({
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
    listenNext: function listenNext(sequencer, done, index) {
      console.log('1');
      return true;
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
  // if (instance.data.loaded <= instance.data.available) {
  //   return ['loadNext', 'listenNext']
  // } else {
  //   let track = foundNextTrack(instance)
  //   listenToTheTrack(track)
  //
  //   return true
  // }
  //   ]
  // },
  {
    name: 'explore',
    sequence: [function () {
      return true;
    }, 'chooseCriterias']
  }, {
    name: 'main',
    sequence: [':run2', function () {
      return console.log('5'), true;
    }, ':run2'],
    onFinish: function onFinish(seq) {
      return console.log('finished', seq);
    },
    onError: function onError(err) {
      return console.log('err');
    }
  }, {
    name: 'run2',
    sequence: [function (seq, done) {
      console.log('3/6', seq, done);setTimeout(done.bind({}), 2000);
    }, function () {
      return console.log('4/7'), true;
    }]
  }];
}).registerMethods(function (restSettings, instance) {
  return {
    chooseCriterias: function chooseCriterias(prevResolution, index, done) {
      console.log('chooseCriterias ...', prevResolution, index);
      setTimeout(done, 1000);
    }
  };
}).run(':main');
// .run(['listenNext', () => { return console.log('2'), true }, ':main'])