import rest from '../../../index'

import credits from '../../../credits'

function promiseFunc(seq, done) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('setTimeout in a promise')
      resolve(true)
    }, 2000)
  })

  return promise
}

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
      listenNext(sequencer, done, index) {
        console.log('1')
        return true
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
      // if (instance.data.loaded <= instance.data.available) {
      //   return ['loadNext', 'listenNext']
      // } else {
      //   let track = foundNextTrack(instance)
      //   listenToTheTrack(track)
      //
      //   return true
      // }
      //   ]
      // },
      {
        name: 'main',
        sequence: [':run2', () => { return console.log('5'), true }, ':run2'],
        onFinish: seq => console.log('finished', seq),
        onError: err => console.log('err')
      },
      {
        name: 'run2',
        sequence: [
          () => { return console.log('message before Promise'), true },
          promiseFunc,
          () => { return console.log('message after Promise'), true }]
      }
    ]
  })
  .run('run2')
  // .run(['listenNext', () => { return console.log('2'), true }, ':main'])
