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

var bot = rest
  .new({
    adapter: 'soundcloud',
    authorization: {
      manual: false,
      redirectURI: 'http://localhost:8080/callback.html',
      clientId: credits.sc.CLIENT_ID,
      clientSecret: credits.sc.CLIENT_SECRET,
    }
  })
  // .registerMethods((restSettings, instance) => {
  //   return function authorize() {
  //     // example of calling super method from the adapter
  //     this._adapter.methods.authorize.apply(this, arguments)
  //   }
  // })
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
        name: 'pattern1',
        sequence: [
          () => !console.log(0),
          () => !console.log(1),
          ':pattern2'
        ]
      },
      {
        name: 'pattern2',
        sequence: [
          () => !console.log(2),
          (data, done, seq, index, stackIndex) => !console.log(3, data),
        ]
      },
    ]
  })
  .run('pattern1')
