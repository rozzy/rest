import assert from 'assert'

import rest from '../src/core'
import { isActionRegistered, checkSequenceAction, checkPatternSequence } from '../src/rest/instanceMethods'
import { findAdapter, useAdapter } from '../src/rest/adapterMethods'

let existingAdapter = {
  name: 'soundcloud',
  methods: {
    authorize() {}
  }
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

  describe('private checkSequenceAction', () => {
    let instance = rest.new({
      adapter: existingAdapter.name
    })

    instance.registerMethods(restSettings => {
      return function someRegisteredMethod() {
        return true
      }
    })

    describe('it should return true', () => {
      it('when passing an anonymous function', () => {
        let executable = () => (
          checkSequenceAction.call(instance, restSettings => {})
        )

        assert.doesNotThrow(executable, Error)
        assert.ok(executable())
      })

      it('when passing an existing method name', () => {
        let executable = () => (
          checkSequenceAction.call(instance, 'someRegisteredMethod')
        )

        assert.doesNotThrow(executable, Error)
        assert.ok(executable())
      })
    })

    describe('it should throw an error', () => {
      it('when passing no argument', () => {
        let executable = () => (
          checkSequenceAction.call(instance)
        )

        assert.throws(executable, /Sequence could only contain strings or functions/)
      })

      it('when passing not a string and not a function', () => {
        let executableArray = () => (
          checkSequenceAction.call(instance, [])
        )
        let executableObject = () => (
          checkSequenceAction.call(instance, {})
        )
        let executableNull = () => (
          checkSequenceAction.call(instance, null)
        )
        let executableNumber = () => (
          checkSequenceAction.call(instance, 12)
        )
        let executableBoolean = () => (
          checkSequenceAction.call(instance, true)
        )
        let executableNaN = () => (
          checkSequenceAction.call(instance, NaN)
        )

        let error = /Sequence could only contain strings or functions/

        assert.throws(executableArray, error)
        assert.throws(executableObject, error)
        assert.throws(executableNull, error)
        assert.throws(executableNumber, error)
        assert.throws(executableBoolean, error)
        assert.throws(executableNaN, error)
      })

      it('when passing a method that doesn\'t exist', () => {
        let executable = () => (
          checkSequenceAction.call(instance, 'someRandomMethod')
        )

        assert.throws(executable, /There is no registered action/)
      })
    })
  })

  describe('private checkPatternSequence', () => {
    let patterns = [{ name: 'test', sequence: ['someRegisteredMethod'] }]
    let instance = rest.new({
      adapter: existingAdapter.name
    })

    instance
      .registerMethods(restSettings => {
        return function someRegisteredMethod() {
          return true
        }
      })
      .loadPatterns(restSettings => patterns)

    describe('it should pass', () => {
      it('when array of existing actions passed', () => {
        let executable = () => {
          checkPatternSequence(patterns[0].sequence, instance)
        }

        assert.doesNotThrow(executable, Error)
      })
    })

    describe('it should throw an error', () => {
      it('when there is no sequence passed', () => {
        let executable = () => {
          checkPatternSequence(undefined, instance)
        }

        assert.throws(executable, /"sequence" should be an array of sequences/)
      })

      it('when the sequence is not an array', () => {
        let executable = subject => () => {
          checkPatternSequence(subject, instance)
        }

        [12, null, NaN, true, {}, 'test'].forEach(subject => {
          assert.throws(executable(subject), /"sequence" should be an array of sequences/)
        })
      })
    })
  })
})
