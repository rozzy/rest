import Twitter from 'twitter'

import { createAuthfileIfNotExist, writeToken, tokenExists, getToken } from './index'
import createServer from '../rest/quickServer'

export function getSoundcloudUrl(credentials) {
  SC.init({
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  })

  return SC.getConnectUrl()
}

export function requestHandler(instance, req, res) {
  if (req.query.error) {
    throw new Error(req.query.error_description)
  }

  // http://localhost:8080/callback.html?code=%code%
  SC.authorize(req.query.code, function(error, accessToken) {
    if (error) {
      throw new Error(error)
    } else {
      // Client is now authorized and able to make API calls
      instance._data.auth.accessToken = accessToken
      instance._data.SC = SC

      instance._onAuthorize()

      writeToken('soundcloud', accessToken)
    }
  })
}

export function authorizeWithToken(credentials, settings, instance, accessToken) {
  SC.init({
    accessToken,
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  })

  instance._data.auth.accessToken = accessToken
  instance._data.SC = SC

  instance._onAuthorize()

  // TODO
  // check here if user can make calls with this accessToken
  // previously there was a SPIKE: JSON parsing errors couln't be caught

  return instance
}

export function authorizeWithoutToken(credentials, settings, instance) {
  let authLink = getSoundcloudUrl(credentials)
  let { spawn } = require('child_process')

  createServer(
    instance.options.authorization.redirectURI,
    requestHandler.bind(requestHandler, instance),
    instance.options.authorization.port
  )

  spawn('open', [authLink])
}

export function authenticateRequests(instance, credentials, tokens) {
  let twitterInstance = new Twitter({
    consumer_key: credentials.consumerKey,
    consumer_secret: credentials.consumerSecret,
    access_token_key: tokens.accessTokenKey,
    access_token_secret: tokens.accessTokenSecret
  })

  instance._data.Twitter = twitterInstance

  return instance
}

export default function twitterAdapter(restSettings) {
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
      authorize(credentials, settings, instance) {
        if (!instance._data.auth) {
          instance._data.auth = {}
        }

        createAuthfileIfNotExist(() => {
          if (tokenExists('twitter_accessToken')) {
            let existingToken = instance._data.auth.accessToken || getToken('twitter')

            return authorizeWithToken(credentials, settings, instance, existingToken)
          }

          return authorizeWithoutToken(credentials, settings, instance)
        })
      },

      deauthorize(credentials, settings, instance) {
        instance._data.auth.accessToken = null
        console.log('@deauthorize', [restSettings, credentials, settings], instance)
      }
    }
  }
}
