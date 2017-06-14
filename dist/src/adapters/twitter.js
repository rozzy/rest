'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSoundcloudUrl = getSoundcloudUrl;
exports.requestHandler = requestHandler;
exports.authorizeWithToken = authorizeWithToken;
exports.authorizeWithoutToken = authorizeWithoutToken;
exports.authenticateRequests = authenticateRequests;
exports.default = twitterAdapter;

var _twitter = require('twitter');

var _twitter2 = _interopRequireDefault(_twitter);

var _index = require('./index');

var _quickServer = require('../rest/quickServer');

var _quickServer2 = _interopRequireDefault(_quickServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSoundcloudUrl(credentials) {
  SC.init({
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  });

  return SC.getConnectUrl();
}

function requestHandler(instance, req, res) {
  if (req.query.error) {
    throw new Error(req.query.error_description);
  }

  // http://localhost:8080/callback.html?code=%code%
  SC.authorize(req.query.code, function (error, accessToken) {
    if (error) {
      throw new Error(error);
    } else {
      // Client is now authorized and able to make API calls
      instance._data.auth.accessToken = accessToken;
      instance._data.SC = SC;

      instance._onAuthorize();

      (0, _index.writeToken)('soundcloud', accessToken);
    }
  });
}

function authorizeWithToken(credentials, settings, instance, accessToken) {
  SC.init({
    accessToken: accessToken,
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  });

  instance._data.auth.accessToken = accessToken;
  instance._data.SC = SC;

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

function authenticateRequests(instance, credentials, tokens) {
  var twitterInstance = new _twitter2.default({
    consumer_key: credentials.consumerKey,
    consumer_secret: credentials.consumerSecret,
    access_token_key: tokens.accessTokenKey,
    access_token_secret: tokens.accessTokenSecret
  });

  instance._data.Twitter = twitterInstance;

  return instance;
}

function twitterAdapter(restSettings) {
  return {
    name: 'twitter',
    defaultThreads: 1,
    defaultLimist: {
      callsPerPeriod: 15,
      perEndpoint: true,
      period: 900
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
          if ((0, _index.tokenExists)('twitter_accessToken')) {
            var existingToken = instance._data.auth.accessToken || (0, _index.getToken)('twitter');

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