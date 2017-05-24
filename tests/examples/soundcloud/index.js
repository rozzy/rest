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
  .new()
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
          function registerFromSequence(seq) {
            console.log(this)
            return true
          },
        ],
        onFinish: seq => console.log('finished', seq),
        onError: err => console.log('err')
      },
    ]
  })
  .run('main')

  var bot = rest
    .new()
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
            (seq) => !console.log(3),
          ]
        },
      ]
    })
    .run('pattern1')
