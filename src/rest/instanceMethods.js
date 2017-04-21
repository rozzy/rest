import { isFunction, isArray, isObject } from 'lodash/core'

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

export function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns
  } else if (isArray(this._patterns)) {
    this._patterns = [...this._patterns, ...patterns]
  }
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

export function registerMethods(methodsGenerator) {
  if (!isFunction(methodsGenerator)) {
    throw new TypeError('Pass the function which returns an object with methods you want to register')
  }

  let methods = methodsGenerator.call(this, this.options, this)
  let isFunc = isFunction(methods)

  if (!isObject(methods) && !isFunc) {
    throw new TypeError('Please return an object or a named function from the "registerMethods" curry function')
  }

  if (isFunc && !methods.name) {
    throw new Error('Please return a named function from "registerMethods" to be able to call it from actions')
  }

  if (!this._methods) {
    this._methods = {}
  }

  if (isFunc) {
    this._methods[methods.name] = methods
  } else {
    this._methods = Object.assign({}, this._methods, methods)
  }

  return this
}

export function loadPatterns(patternsGenerator) {
  let typeErrorString = 'Pass the function which returns a set of patterns to the "loadPatterns" method'
  if (!isFunction(patternsGenerator)) {
    throw new TypeError(typeErrorString)
  }

  let patterns = patternsGenerator.call(this, this.options, this)
  if (!isArray(patterns)) {
    throw new TypeError(typeErrorString)
  }

  // checkAllPatterns(patterns, this) TODO check patterns on run
  registerPatterns.call(this, patterns)

  return this
}

export function commandExists() {

}

export function runSequence(sequence) {
  console.log(sequence)
}

export function findSequence(instance, sequenceName) {
  let foundSequence = instance._patterns.filter(pattern => {
    return pattern.name === sequenceName
  })

  return foundSequence && foundSequence[0]
}

export function isSequence(instance, command) {
  if (typeof command !== 'string') {
    throw new TypeError('Command should be a string')
  }

  if (command[0] === ':') {
    command = command.slice(1)
  }

  let sequenceFound = findSequence(instance, command)

  return !!sequenceFound
}

export function runCommand(command) {
  if (typeof command === 'string' && isSequence(this, command)) {
    return runSequence.call(this, command)
  }

  if (commandExists(command)) {

  }

  throw new Error('Command doesn\'t exist', command)
}

export function run(commands) {
  if (!this.runned) {
    this.runned = []
  }

  this.runned.push(+new Date)

  // checkAllPatterns(patterns, this) TODO check patterns on run
  if (this.options.authorization && !this.options.authorization.manual) {
    this.authorize()
  }

  if (typeof commands === 'string') {
    runCommand.call(this, commands)
  }

  if (isArray(commands)) {
    commands.forEach(runCommand.bind(this))
  }

  return this
}
