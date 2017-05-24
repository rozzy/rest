import { isFunction, isArray, isObject } from 'lodash/core'

let sequencer = {
  public: {
    index: null,
    repeat
  },

  index: null,
  createNew, repeat, next
}

export function repeat() {
  this.public.index += 1
  this.index = 0

  return this.next(this.instance)
}

export function createNew(instance, pattern, executable) {
  this.public.index = 0
  this.index = 0
  this.last = null
  this.pattern = pattern
  this.sequence = pattern.sequence
  this.instance = instance

  executable(this)

  return this
}

export function next(instance) {
  let { next } = this
  let { index } = this

  let currentAction = this.sequence[index]

  let proceed = () => {
    if (this.index + 1 < this.sequence.length) {
      this.index += 1
      this.public.index += 1
      this.next(instance)
    }
  }

  let checkResultTypeAndProceed = (actionResult) => {
    if (actionResult === true) {
      return proceed()
    } else if (!actionResult) {
      return
    }

    registerNamedFunction(actionResult)

    if (isntRepeatingSequence(actionResult)) {
      injectIntoSequence(index + 1, actionResult, this.sequence, false)
      return proceed()
    }
  }

  registerNamedFunction(currentAction)

  if (isntRepeatingSequence(currentAction)) {
    let step = parseAction(currentAction, instance, this.sequence, index)
    let executionResult = step.call(instance, this.public, proceed, this.public.index, index)

    if (isObject(executionResult) && isFunction(executionResult.then)) {
      executionResult
      .then(checkResultTypeAndProceed, checkResultTypeAndProceed)
    } else if (!!executionResult) {
      checkResultTypeAndProceed(executionResult)
    }
  }
}

export function registerNamedFunction(func) {
  if (isFunction(func) && func.name) {
    sequencer.instance.registerMethods(_ => func)
  }
}

export function isntRepeatingSequence(action) {
  let isRepeatingSequence = (
    isSequence(action) && action === `:${sequencer.pattern.name}`
  )

  if (isRepeatingSequence) {
    sequencer.repeat()
  }

  return !isRepeatingSequence
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

export function parseAction(action, instance, sequence, index) {
  if (isSequence(action) || isArray(action)) {
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
  let sequence

  if (isArray(action)) {
    sequence = action
  } else {
    sequence = findPattern(instance, action).sequence
  }

  injectIntoSequence(index, sequence, seq)

  let expandedResult = seq[index]
  return parseAction(expandedResult, instance, seq, index)
}

export function injectIntoSequence(index, itemsToInject, sequence, replace = true) {
  if (!isArray(itemsToInject)) {
    sequence.splice(index, +replace, itemsToInject)
  } else {
    sequence.splice.apply(sequence, [index, +replace].concat(itemsToInject))
  }
}

export function runSequence(sequencer, instance, pattern) {
  sequencer.next(instance)
}

export function executePattern(instance, pattern) {
  return sequencer.createNew(
    instance, pattern,
    sequencer => runSequence(sequencer, instance, pattern)
  )
}

export function isActionRegistered(action, instance) {
  return !!instance && !!instance._methods && typeof action === 'string' && (
    !!instance._methods[action] &&
    isFunction(instance._methods[action])
  )
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
