import SC from 'node-soundcloud'

console.log(SC)

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
        SC.init({
          id: credentials.clientId,
          secret: credentials.clientSecret,
          uri: credentials.redirectURI
        })

        return SC.getConnectUrl()
      },

      deauthorize(credentials, settings, instance) {
        console.log('@deauthorize', [restSettings, credentials, settings], instance)
      }
    }
  }
}
