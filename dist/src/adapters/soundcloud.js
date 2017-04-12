'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSoundcloudUrl = getSoundcloudUrl;
exports.default = soundcloudAdapter;

var _nodeSoundcloud = require('node-soundcloud');

var _nodeSoundcloud2 = _interopRequireDefault(_nodeSoundcloud);

var _quickServer = require('../rest/quickServer');

var _quickServer2 = _interopRequireDefault(_quickServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSoundcloudUrl(credentials) {
  _nodeSoundcloud2.default.init({
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  });

  return _nodeSoundcloud2.default.getConnectUrl();
}

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
        var url = getSoundcloudUrl(credentials);
        var spawn = require('child_process').spawn;

        (0, _quickServer2.default)(function (req, res) {});
        spawn('open', [url]);
      },
      deauthorize: function deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance);
      }
    }
  };
}