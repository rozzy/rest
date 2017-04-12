import SC from 'node-soundcloud'
import createServer from '../rest/quickServer'

export function getSoundcloudUrl(credentials) {
  SC.init({
    id: credentials.clientId,
    secret: credentials.clientSecret,
    uri: credentials.redirectURI
  })

  return SC.getConnectUrl()
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
        let authLink = getSoundcloudUrl(credentials)
        let spawn = require('child_process').spawn

        createServer(instance.options.authorization.redirectURI, (req, res) => {
          if (req.query.error) {
            throw new Error(req.query.error_description)
          }

          // http://localhost:8080/callback.html?code=%code%
          console.log(req.query)
        })

        spawn('open', [authLink])
      },

      deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance)
      }
    }
  }
}
