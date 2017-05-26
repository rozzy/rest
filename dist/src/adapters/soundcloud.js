'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSoundcloudUrl = getSoundcloudUrl;
exports.requestHandler = requestHandler;
exports.authorizeWithToken = authorizeWithToken;
exports.authorizeWithoutToken = authorizeWithoutToken;
exports.default = soundcloudAdapter;

var _nodeSoundcloud = require('node-soundcloud');

var _nodeSoundcloud2 = _interopRequireDefault(_nodeSoundcloud);

var _index = require('./index');

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

function requestHandler(instance, req, res) {
  if (req.query.error) {
    throw new Error(req.query.error_description);
  }

  // http://localhost:8080/callback.html?code=%code%
  _nodeSoundcloud2.default.authorize(req.query.code, function (error, accessToken) {
    if (error) {
      throw new Error(error);
    } else {
      // Client is now authorized and able to make API calls
      instance._data.auth.accessToken = accessToken;
      instance._data.SC = _nodeSoundcloud2.default;

      instance._onAuthorize();

      (0, _index.writeToken)('soundcloud', accessToken);
    }
  });
}

function authorizeWithToken(credentials, settings, instance, accessToken) {
  _nodeSoundcloud2.default.init({
    accessToken: accessToken,
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  });

  instance._data.auth.accessToken = accessToken;
  instance._data.SC = _nodeSoundcloud2.default;

  instance._onAuthorize();

  // TODO
  // check here if user can make calls with this accessToken
  // previously there was a SPIKE: JSON parsing errors couln't be caught

  return instance;
}

function authorizeWithoutToken(credentials, settings, instance) {
  var authLink = getSoundcloudUrl(credentials);

  var _require = require('child_process'),
      spawn = _require.spawn;

  (0, _quickServer2.default)(instance.options.authorization.redirectURI, requestHandler.bind(requestHandler, instance), instance.options.authorization.port);

  spawn('open', [authLink]);
}

function soundcloudAdapter(restSettings) {
  return {
    name: 'soundcloud',
    defaultThreads: 1,
    defaultLimist: {
      callsPerPeriod: 15000,
      period: 86400
    },

    authorization: {
      async: true,
      manual: false
    },

    methods: {
      authorize: function authorize(credentials, settings, instance) {
        if (!instance._data.auth) {
          instance._data.auth = {};
        }

        (0, _index.createAuthfileIfNotExist)(function () {
          if ((0, _index.tokenExists)('soundcloud')) {
            var existingToken = instance._data.auth.accessToken || (0, _index.getToken)('soundcloud');

            return authorizeWithToken(credentials, settings, instance, existingToken);
          }

          return authorizeWithoutToken(credentials, settings, instance);
        });
      },
      deauthorize: function deauthorize(credentials, settings, instance) {
        instance._data.auth.accessToken = null;
        console.log('@deauthorize', [restSettings, credentials, settings], instance);
      }
    }
  };
}