import rest from '../../../index'

import credits from '../../../credits'

function promiseFunc(seq, done) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('setTimeout in a promise')
      resolve(() => { return console.log('injected from promise result'), true })
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
      {
        name: 'main',
        sequence: [
          function registerFromSequence() {
            console.log('i am registered now')
            return true
          },
          'registerFromSequence'
        ],
        onFinish: seq => console.log('finished', seq),
        onError: err => console.log('err')
      },
    ]
  })
  .run('main')
