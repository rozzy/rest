import SC from 'node-soundcloud'

import { writeToken, tokenExists, getToken } from './index'
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
      if (!instance.data) {
        instance.data = {}
      }

      instance.data.accessToken = accessToken
      instance.SC = SC

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

  // TODO
  // check here if user can make calls with this accessToken
  // previously there was a SPIKE: JSON parsing errors couln't be caught

  return instance
}

export function authorizeWithoutToken(credentials, settings, instance) {
  let authLink = getSoundcloudUrl(credentials)
  let spawn = require('child_process').spawn

  createServer(
    instance.options.authorization.redirectURI,
    requestHandler.bind(requestHandler, instance)
  )

  spawn('open', [authLink])
}

export default function soundcloudAdapter(restSettings) {
  return {
    name: 'soundcloud',
    defaultThreads: 1,
    defaultLimist: {
      callsPerPeriod: 15000,
      period: 86400
    },

    methods: {
      authorize(credentials, settings, instance) {
        if (tokenExists('soundcloud')) {
          let existingToken = getToken('soundcloud')

          return authorizeWithToken(credentials, settings, instance, existingToken)
        }

        authorizeWithoutToken(credentials, settings, instance)
      },

      deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance)
      }
    }
  }
}
