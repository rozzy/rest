import assert from 'assert'

import rest from '../src/core'
import { findAdapter, useAdapter } from '../src/rest/instanceMethods'

let existingAdapter = {
  name: 'soundcloud',
  authorize() {}
}

rest.registerAdapter(restSettings => existingAdapter)

let instance = rest.new({
  adapter: existingAdapter.name
})

describe('Testing instance methods:', () => {
  describe('instance.findAdapter()', () => {
    describe('it should pass', () => {
      it('when passing the name of an existing adapter', () => {
        let executable = () => {
          findAdapter.call(instance, existingAdapter.name)
        }

        assert.doesNotThrow(executable, Error)
      })
    })
    describe('it should throw an error', () => {
      it('when passing no argument', () => {
        let executable = () => {
          findAdapter.call(instance)
        }

        assert.throws(executable, /Pass an adapter name to the "findAdapter" method/)
      })

      it('when passing not registered adapter name', () => {
        let executable = () => {
          findAdapter.call(instance, 'custom')
        }

        assert.throws(executable, /There is no adapter registered with the name/)
      })
    })
  })

  describe('instance.useAdapter()', () => {
    describe('it should pass', () => {
      it('when trying to use existing adapter', () => {
        let executable = () => {
          useAdapter.call(instance, existingAdapter.name)
        }

        assert.doesNotThrow(executable, Error)
      })

      it('when checking the adapter name of the instance and it equals to the adapter we\'ve chosen', () => {
        assert.equal(instance._adapter.name, existingAdapter.name)
      })
    })

    describe('it should throw an error', () => {
      it('when trying to use not registered adapter name', () => {
        let executable = () => {
          useAdapter.call(instance, 'custom')
        }

        assert.throws(executable, /There is no adapter registered with the name/)
      })

      it('when passing no argument', () => {
        let executable = () => {
          useAdapter.call(instance)
        }

        assert.throws(executable, /Pass an adapter name to the "useAdapter" method/)
      })
    })
  })
})
