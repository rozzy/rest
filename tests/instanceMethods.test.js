import assert from 'assert'

import rest from '../src/core'
import { findAdapter, useAdapter, isActionRegistered } from '../src/rest/instanceMethods'

let existingAdapter = {
  name: 'soundcloud',
  authorize() {}
}

rest.registerAdapter(restSettings => existingAdapter)

describe('Testing instance methods:', () => {
  describe('instance.findAdapter()', () => {
    let instance = rest.new({
      adapter: existingAdapter.name
    })

    describe('it should pass', () => {
      it('when passing the name of an existing adapter', () => {
        let executable = () => {
          findAdapter(instance.adapters, existingAdapter.name)
        }

        assert.doesNotThrow(executable, Error)
      })
    })
    describe('it should throw an error', () => {
      it('when passing no name argument', () => {
        let executable = () => {
          findAdapter(instance.adapters)
        }

        assert.throws(executable, /Pass an adapter name to the "findAdapter" method/)
      })

      it('when passing not registered adapter name', () => {
        let executable = () => {
          findAdapter(instance.adapters, 'custom')
        }

        assert.throws(executable, /There is no adapter registered with the name/)
      })

      it('when passing empty adapters list', () => {
        let executable = () => {
          findAdapter(undefined, 'custom')
        }

        assert.throws(executable, /There are no registered adapters/)
      })
    })
  })

  describe('instance.useAdapter()', () => {
    let instance = rest.new({
      adapter: existingAdapter.name
    })

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

  describe('private isActionRegistered', () => {
    let instance = rest.new({
      adapter: existingAdapter.name
    })

    instance.registerMethods(restSettings => {
      return function someRegisteredMethod() {
        return true
      }
    })

    describe('it should return true', () => {
      it('when passing a method that exists in instance._methods array', () => {
        let result = isActionRegistered.call(instance, 'someRegisteredMethod')

        assert.ok(result)
      })
    })

    describe('it should return false', () => {
      it('when passing no argument', () => {
        let result = isActionRegistered.call(instance)

        assert.equal(result, false)
      })
      it('when passing non existing method', () => {
        let result = isActionRegistered.call(instance, 'randomMethodName')

        assert.equal(result, false)
      })
      it('when passing not a string', () => {
        let boolResult = isActionRegistered.call(instance, true)
        let objectResult = isActionRegistered.call(instance, {})
        let funcResult = isActionRegistered.call(instance, function() {})
        let numberResult = isActionRegistered.call(instance, 10)
        let arrayResult = isActionRegistered.call(instance, [])
        let nullResult = isActionRegistered.call(instance, null)
        let nanResult = isActionRegistered.call(instance, NaN)

        assert.equal(funcResult, false)
        assert.equal(numberResult, false)
        assert.equal(boolResult, false)
        assert.equal(objectResult, false)
        assert.equal(arrayResult, false)
        assert.equal(nullResult, false)
        assert.equal(nanResult, false)
      })
    })
  })
})
