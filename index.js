import rest from './src/rest'

rest.registerAdapter('test')

var bot = rest.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  // adapter: 'custom',
  // adapterSettings: {
  //   name: ''
  // }
  threads: 1,
  credentials: {
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
