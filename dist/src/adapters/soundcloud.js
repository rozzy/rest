'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = soundcloudAdapter;

var _nodeSoundcloud = require('node-soundcloud');

var _nodeSoundcloud2 = _interopRequireDefault(_nodeSoundcloud);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_nodeSoundcloud2.default);

function soundcloudAdapter(restSettings) {
  return {
    name: 'soundcloud',
    defaultThreads: 1,
    defaultLimist: {
      callsPerPeriod: 15000,
      period: 86400
    },

    methods: {
      authorize: function authorize(credentials, settings, instance) {
        _nodeSoundcloud2.default.init({
          id: credentials.clientId,
          secret: credentials.clientSecret,
          uri: credentials.redirectURI
        });

        return _nodeSoundcloud2.default.getConnectUrl();
      },
      deauthorize: function deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance);
      }
    }
  };
}