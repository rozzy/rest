import { isFunction, isArray, isObject } from 'lodash/core'

let sequencer = {
  index: null,

  createNew, repeat
}

export function repeat() {
  this.index += 1

  return this.last()
}

export function createNew(previousSequence, executable) {
  this.index = (previousSequence && previousSequence.index) || 0
  this.last = (previousSequence && previousSequence.last) || null

  executable(this)

  return this
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

export function findCommand(instance, command) {
  return instance._methods[command]
}

export function runSequence(seq, instance, method) {
  console.log('sequence:', method)
  console.log(instance._patterns)
}

export function executePattern(instance, sequence, previousSequence) {
  return sequencer.createNew(
    previousSequence,
    seq => runSequence(seq, instance, sequence)
  )
}

export function isActionRegistered(action) {
  return !!this && !!this._methods && typeof action === 'string' && (
    !!this._methods[action] &&
    isFunction(this._methods[action])
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
