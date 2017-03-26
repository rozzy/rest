import rest from './src/core'
import soundcloudAdapter from './src/adapters/soundcloud'

rest.registerAdapter(soundcloudAdapter)

var bot = rest.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  threads: 1,
  authorization: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectURI: 'http://localhost:8000/authorize'
  },
  limits: {
    callsPerPeriod: 15000,
    period: 86400
  }
})

bot.run()
