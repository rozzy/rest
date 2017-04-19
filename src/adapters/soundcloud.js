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
      instance.SC = SC
      if (!instance.data) {
        instance.data = {}
      }
      instance.data.accessToken = accessToken
      writeToken('soundcloud', accessToken)
    }
  })
}

export function authorizeWithToken(credentials, existingToken) {
  SC.init({
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI,
    accessToken: existingToken
  })

  return existingToken
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

          return authorizeWithToken(credentials, existingToken)
        }

        let authLink = getSoundcloudUrl(credentials)
        let spawn = require('child_process').spawn

        createServer(
          instance.options.authorization.redirectURI,
          requestHandler.bind(requestHandler, instance)
        )

        spawn('open', [authLink])
      },

      deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance)
      }
    }
  }
}
