import assert from 'assert'

import rest from '../src/core'
import soundcloudAdapter from '../src/adapters/soundcloud'

describe('Checking adapters:', () => {
  describe('rest.registerAdapter()', () => {
    it('should throw an error when passing not a function', () => {
      let executable = rest.registerAdapter

      assert.throws(executable, TypeError)
    })

    it('should throw an error when passing an empty function', () => {
      let executable = () => {
        rest.registerAdapter(function () { })
      }

      assert.throws(executable, TypeError)
    })

    it('should throw an error when there is no `authorize` method in adapter constructor', () => {
      let executable = () => {
        rest.registerAdapter(function () { return { } })
      }

      assert.throws(executable, Error)
    })

    it('should not add a new adapter to the list of all adapters, if there are any errors', () => {
      let brokenAdapter = { name: 'brokenAdapter1' }
      let executable = () => {
        rest.registerAdapter(function () { return brokenAdapter })
      }

      assert.throws(executable, Error)
      assert.equal(rest.adapters.indexOf(brokenAdapter), -1)
    })

    it('should execute without any errors when passing proper function', () => {
      let executable = () => {
        rest.registerAdapter(function () {
          return {
            name: 'testAdapter',
            authorize: () => console.log('authorized')
          }
        })
      }

      assert.doesNotThrow(executable, Error)
    })

    it('should add a new adapter to the list of all adapters', () => {
      let newAdapter = {
        name: 'testAdapter2',
        authorize: () => console.log('authorized')
      }

      rest.registerAdapter(() => newAdapter)

      assert.notEqual(rest.adapters.indexOf(newAdapter), -1)
    })
  })
})
