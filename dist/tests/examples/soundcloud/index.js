'use strict';

var _index = require('../../../index');

var _index2 = _interopRequireDefault(_index);

var _credits = require('../../../credits');

var _credits2 = _interopRequireDefault(_credits);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function promiseFunc(seq, done) {
  var promise = new Promise(function (resolve, reject) {
    setTimeout(function () {
      console.log('setTimeout in a promise');
      resolve(function () {
        return console.log('injected from promise result'), true;
      });
    }, 2000);
  });

  return promise;
}

var bot = _index2.default.new({
  adapter: 'soundcloud',
  authorization: {
    manual: false,
    redirectURI: 'http://localhost:8080/callback.html',
    clientId: _credits2.default.sc.CLIENT_ID,
    clientSecret: _credits2.default.sc.CLIENT_SECRET
  }
})
// .registerMethods((restSettings, instance) => {
//   return function authorize() {
//     // example of calling super method from the adapter
//     this._adapter.methods.authorize.apply(this, arguments)
//   }
// })
.registerMethods(function (restSettings, instance) {
  return {
    listenNext: function listenNext(sequencer, done, index) {
      console.log('1');
      return true;
    }
  };
}).loadPatterns(function (restSettings, instance) {
  return [{
    name: 'pattern1',
    sequence: [function () {
      return !console.log(0);
    }, function () {
      return !console.log(1);
    }, ':pattern2']
  }, {
    name: 'pattern2',
    sequence: [function () {
      return !console.log(2);
    }, function (data, done, seq, index, stackIndex) {
      return !console.log(3, data);
    }]
  }];
}).run('pattern1');