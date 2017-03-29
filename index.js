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

bot
  .registerMethods((restSettings, instance) => {
    return function testmethods() {
      return true
    }
  })
  .registerMethods((restSettings, instance) => {
    return {
      listenNext(prevResolution, index, done) {
        if (instance.data.loaded <= instance.data.available) {
          return ['loadNext', 'listenNext']
        } else {
          let track = foundNextTrack(instance)
          listenToTheTrack(track)

          return true
        }
      }
    }
  })
  .loadPatterns((restSettings, instance) => {
    return [
      {
        name: 'main',
        sequence: [
          ':explore',
          (prevResolution, index, done) => {
            if (prevResolution === true) {
              return ':listenToNewTracks'
            } else {
              return false
            }
          },
          (prevResolution, index, done, sequencer) => {
            if (prevResolution === true) return sequencer.repeat()
          }
        ]
      },
      {
        name: 'explore',
        sequence: ['chooseCriterias', 'findTrackToStartExplore', 'collectExploreData']
      }
    ]
  })
  .registerMethods((restSettings, instance) => {
    return {
      chooseCriterias(prevResolution, index, done) {
        console.log('chooseCriterias ...', prevResolution, index)
        setTimeout(done, 1000)
      }
    }
  })
  .run()
