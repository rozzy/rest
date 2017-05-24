import { isFunction, isArray, isObject } from 'lodash/core'

// TODO
// how to improve sequencer:

// to allow a user repeat a particular sequence, execute onStart/onFinish/onError
// callbacks for a particular sequence, it is possible to emplement pointers
// which will be stored in a sequencer and will virtually split the stack into
// a set of sequences. it will store data in the sequencer object. when there is
// a sequence in the stack, before expanding the sequnce it will mark it's start
// (current index in the stack). then sequncer could be redirected to that stack
// index (implement goTo or repeatCurrentSequence), also user will be able
// to check the name of actual sequence to make more complex data calculations.

// implementing onFinish method could be pretty hard, because it is very hard
// to understand where is the end of a particular sequence: a method could expand
// the stack with returning a new sequence. so that, if onFinish is specified for
// a particular pattern, we could wrap the last element into a function that will
// execute this onFinish method and return original action. just a simple decorator.
// this could be also applied to onStart method. the only thing i have to think
// about is how to make this pattern callback execute after stack action that
// will be wrapped.

// implementing the pointers system. all pointers will be stored in a particular
// space inside of the sequencer object. it is a simple object with the following
// structure:
// pointers: {
//   0: 'pattern1',
//   2: 'pattern2',
//   3: [pattern1OnFinish, pattern2OnFinish]
// }
// this is how the pointers object will be stored for the following patterns:
// [{
//   name: 'pattern1',
//               0 in stack        1 in stack (index)
//   sequence: [someRandomMethod, someTestMethod, ':pattern2'],
//   onFinish: pattern1OnFinish
// }, {
//   name: 'pattern2',
//              2 in stack         3 in stack (index)
//   sequnce: [someAnotherMethod, someLastMethod],
//   onFinish: pattern2OnFinish
// }]
// since the first pattern has a link to the second pattern, and they both have
// onFinish callbacks, callbacks should be executed one after another.
// we can also see that in pointers object on 0 and 2 indexes there are names
// of patterns. that is how we can detect which sequence is used at the moment.
// we can also just set the current sequence name to sequencer object.

// the hardest part is to detect when the finish of the sequnce, because these
// 2 patterns from above will look like that in the stack:
//   0                 1               2                  3
// [someRandomMethod, someTestMethod, someAnotherMethod, someLastMethod]
// but i can try to implement the pattern described above.

let sequencer = {
  public: {
    index: null,
    prevResolution: null,
    last: null,
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
  this.pattern = pattern
  this.stack = pattern.sequence
  this.instance = instance

  executable(this)

  return this
}

export function next(instance) {
  let { next } = this
  let { index } = this

  let currentAction = this.stack[index]

  let proceed = () => {
    if (this.index + 1 < this.stack.length) {
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
      injectIntoSequence(index + 1, actionResult, this.stack, false)
      return proceed()
    }
  }

  registerNamedFunction(currentAction)

  if (isntRepeatingSequence(currentAction)) {
    let step = parseAction(currentAction, instance, this.stack, index)
    let executionResult = step.call(
      instance,
      instance._data, proceed, this.public, this.public.index, index
    )

    this.public.last = step
    this.public.prevResolution = executionResult

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
