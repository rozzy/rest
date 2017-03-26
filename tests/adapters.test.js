import assert from 'assert'

import rest from '../src/core'

describe('Testing adapters:', () => {
  describe('rest.registerAdapter()', () => {
    describe('should pass', () => {
      it('when passing a proper authorize function and name', () => {
        let executable = () => {
          rest.registerAdapter(function () {
            return {
              name: 'testAdapter',
              authorize() { console.log('authorized') }
            }
          })
        }

        assert.doesNotThrow(executable, Error)
      })
    })

    it('should add a new adapter to the list of all adapters', () => {
      let newAdapter = {
        name: 'testAdapter2',
        authorize() { console.log('authorized') }
      }

      rest.registerAdapter(() => newAdapter)

      assert.notEqual(rest.adapters.indexOf(newAdapter), -1)
    })

    describe('should throw an error', () => {
      it('when passing not a function', () => {
        let executable = rest.registerAdapter

        assert.throws(executable, /Adapter must be a function/)
      })

      it('when passing an empty function', () => {
        let executable = () => {
          rest.registerAdapter(function () { })
        }

        assert.throws(executable, /Adapter must return a valid object/)
      })

      it('when there is no `authorize` method in adapter constructor', () => {
        let executable = () => {
          rest.registerAdapter(function () { return { name: 'test' } })
        }

        assert.throws(executable, /Adapter should contain "authorize" method/)
      })

      it('when there is no `name` specified', () => {
        let executable = () => {
          rest.registerAdapter(function () { return { authorize() {} } })
        }

        assert.throws(executable, /Adapter should contain the "name" property/)
      })
    })

    describe('should not add a new adapter to the list of all adapters, ', () => {
      it('if there is no name specified', () => {
        let brokenAdapter = { authorize() {} }
        let executable = () => {
          rest.registerAdapter(function () { return brokenAdapter })
        }

        assert.throws(executable, /Adapter should contain the "name" property/)
        assert.equal(rest.adapters.indexOf(brokenAdapter), -1)
      })

      it('if there is no authorize method', () => {
        let brokenAdapter = { name: 'brokenAdapter1' }
        let executable = () => {
          rest.registerAdapter(function () { return brokenAdapter })
        }

        assert.throws(executable, /Adapter should contain "authorize" method/)
        assert.equal(rest.adapters.indexOf(brokenAdapter), -1)
      })

      it('if the authorize method is not executable', () => {
        let brokenAdapter = { name: 'brokenAdapter2', authorize: undefined }
        let executable = () => {
          rest.registerAdapter(function () { return brokenAdapter })
        }

        assert.throws(executable, /"authorize" method must be a function/)
        assert.equal(rest.adapters.indexOf(brokenAdapter), -1)
      })
    })
  })
})
