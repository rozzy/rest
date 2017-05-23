import { isFunction, isArray, isObject } from 'lodash/core'

let sequencer = {
  index: null,

  createNew, repeat, executeMethod, next
}

export function repeat() {
  this.index += 1

  return this.last()
}

export function createNew(pattern, executable) {
  this.index = 0
  this.last = null
  this._pattern = pattern
  this.sequence = pattern.sequence

  executable(this)

  return this
}

export function next(instance) {
  let { index, next } = this

  let proceed = () => {
    if (this.index + 1 < this.sequence.length) {
      this.index += 1
      this.next(instance)
    }
  }

  // console.log('next 0--->', this.sequence);
  // console.log('next 1--->', index);
  let step = parseCurrentStep(this.sequence[index], instance, this.sequence, index)
  let executionResults = step.call(instance, this, proceed, index)

  if (executionResults === true) {
    return proceed()
  }

  // if (executionResults === )
}

export function executeMethod(executable) {
  let executionResults = executable({ index: ++this.index, done: () => {} })

  // console.log('===> result:', executionResults)
}

export function commandExists(instance, commandName) {
  return isFunction(instance._methods[commandName])
}

export function runCommand(command) {
  if (typeof command === 'string' && isSequence(this, command)) {
    return executeSequence.call(this, command)
  }

  if (isFunction(command) || commandExists(this, command)) {
    return execute(this, command)
  }

  throw new Error('Command doesn\'t exist', command)
}

export function isSequence(givenAction) {
  return typeof givenAction === 'string' && givenAction[0] === ':'
}

export function getExecutableAction(action, instance) {
  if (isFunction(action)) {
    return action
  }

  if (!instance || !instance._methods) {
    throw new Error('Instance doesn\'t have any methods registered')
  }

  return instance._methods[action]
}

export function executeAction(action, instance, sequencer) {
  let executableAction = getExecutableAction(action, instance)

  sequencer.executeMethod(execution => {
    return executableAction.call(instance, sequencer, execution.done, execution.index)
  })
}

// sequencer = {}
//
// sequence = [.., .., .., .., [.., .., .., [.., .., ..]]]
// sequencer.registerSequence(sequence)
//
// sequencer.next(localIndex)
// next(index) {
//   let proceed = () => next(index + 1)
//   let executionResult = sequence[index](sequencer, proceed, index)
//
//   if (!sequence[index + 1]) {
//     return sequence.pattern.onFinish
//   }
//
//   function checkResultTypeAndProceed(result) {
//     if (result === true) {
//       return proceed()
//     }
//
//     if (result === 'string') {
//       executable = getExecutable(result)
//       injectIntoStack(index, executable)
//       return proceed()
//     }
//
//     if (result === 'function') {
//       injectIntoStack(index, result)
//       return proceed()
//     }
//
//     if (result === 'array' && validSequence(result)) {
//       result.forEach((executable, exIndex) => {
//         injectIntoStack(index + exIndex, executable)
//       })
//       return proceed()
//     }
//
//     if (isFunction(pattern.onFinish)) {
//       pattern.onFinish(index)
//     }
//     return false
//   }
//
//   if (executionResult === 'promise') {
//     result.then(promiseResult => {
//       checkResultTypeAndProceed(promiseResult)
//     })
//   } else {
//     checkResultTypeAndProceed(executionResult)
//   }
// }

export function parseCurrentStep(action, instance, sequence, index) {
  // console.log('parseCurrentStep ------>', action)
  if (isSequence(action)) {
    return expandSequence(action, instance, sequence, index)
  }

  if (isFunction(action)) {
    return action
  }

  if (isActionRegistered(action, instance)) {
    return getExecutableAction(action, instance)
  }

  throw new Error('Action is unregistered: ' + action)
}

export function expandSequence(action, instance, seq, index) {
  let { sequence } = findPattern(instance, action)
  injectIntoSequence(index, sequence, seq)

  let expandedResult = seq[index]
  return parseCurrentStep(expandedResult, instance, seq, index)
}

export function injectIntoSequence(index, itemsToInject, sequence) {
  if (!isArray(itemsToInject)) {
    sequence.splice(index, 1, itemsToInject)
  } else {
    sequence.splice.apply(sequence, [index, 1].concat(itemsToInject))
  }
}

export function runSequence(sequencer, instance, pattern) {
  sequencer.next(instance)
}

export function executePattern(instance, pattern) {
  return sequencer.createNew(
    pattern,
    sequencer => runSequence(sequencer, instance, pattern)
  )
}

export function isActionRegistered(action, instance) {
  return !!instance && !!instance._methods && typeof action === 'string' && (
    !!instance._methods[action] &&
    isFunction(instance._methods[action])
  )
}

export function checkSequenceAction(action) {
  let isString = typeof action === 'string'
  let isFunc = isFunction(action)

  if (!isFunc && !isString) {
    throw new TypeError('Sequence could only contain strings or functions')
  }

  if (!isFunc && !isActionRegistered.call(this, action)) {
    throw new Error(`There is no registered action "${action}"`)
  }

  return true
}

export function checkPatternSequence(sequence, context) {
  if (!sequence || !sequence.map) {
    throw new TypeError('"sequence" should be an array of sequences')
  }

  return sequence.map(checkSequenceAction.bind(context))
}

export function checkPattern(pattern) {
  if (!isObject(pattern)) {
    throw new TypeError('Pattern should be a plain object')
  }

  if (!pattern.hasOwnProperty('sequence')) {
    throw new TypeError('Pattern should contain the "sequence" property')
  }

  if (!isArray(pattern.sequence)) {
    throw new TypeError('"Sequence" property should be an array of actions (see docs: sequence)')
  }

  checkPatternSequence(pattern.sequence, this)

  return true
}

export function checkAllPatterns(patterns, context) {
  return patterns.forEach(checkPattern.bind(context))
}

export function isMethodRegistered(wantedMethod) {
  if (!this._methods) {
    return false
  }

  let foundMethod = this._methods.filter(method => {
    return method === wantedMethod
  })

  return foundMethod && foundMethod.length > 0
}


// looks if the pattern was registered previously in the instance
// returns it when found
export function findPattern(instance, givenPattern) {
  if (isArray(givenPattern)) {
    // this is an anonymous pattern
    return { sequence: givenPattern }
  }

  if (typeof givenPattern !== 'string') {
    throw new TypeError('"pattern" should be a string/array')
  }

  if (givenPattern[0] === ':') {
    givenPattern = givenPattern.slice(1)
  }

  let foundPattern = instance._patterns.filter(currentPattern => {
    return currentPattern.name === givenPattern
  })

  let pattern = foundPattern && foundPattern[0]

  if (!pattern) {
    throw new Error('Not a pattern: ' + givenPattern)
  }

  if (!pattern.sequence || !isArray(pattern.sequence)) {
    throw new TypeError('The pattern should contain a sequence (array): ' + givenPattern)
  }

  return pattern
}
