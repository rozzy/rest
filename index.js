import rest from './src/core'
import soundcloudAdapter from './src/adapters/soundcloud'

import credits from './credits'

rest.registerAdapter(soundcloudAdapter)

var bot = rest.new({
  adapter: 'soundcloud', // twitter, instagram, youtube, custom
  threads: 1,
  authorization: {
    clientId: credits.sc.CLIENT_ID,
    clientSecret: credits.sc.CLIENT_SECRET,
    redirectURI: 'http://localhost:8080/callback.html',
  },
  limits: {
    callsPerPeriod: 15000,
    period: 86400
  }
})

bot
  .registerMethods((restSettings, instance) => {
    return function authorize() {
      // example of calling super method from the adapter
      this._adapter.methods.authorize.apply(this, arguments)
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
      // {
      //   name: 'main',
      //   sequence: [
      //     ':explore',
      //     (prevResolution, index, done) => {
      //       if (prevResolution === true) {
      //         return ':listenToNewTracks'
      //       } else {
      //         return false
      //       }
      //     },
      //     (prevResolution, index, done, sequencer) => {
      //       if (prevResolution === true) return sequencer.repeat()
      //     }
      //   ]
      // },
      {
        name: 'explore',
        sequence: ['listenNext']
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
