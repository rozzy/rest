import { isFunction, isArray, isObject } from 'lodash/core'
import { executePattern, commandExists } from './sequencer'

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

export function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns
  } else if (isArray(this._patterns)) {
    this._patterns = [...this._patterns, ...patterns]
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

  registerPatterns.call(this, patterns)

  return this
}

export function initializePattern(instance, givenPattern) {
  let pattern = findPattern(instance, givenPattern)

  if (!pattern) {
    throw new Error('Not a pattern: ' + givenPattern)
  }

  return executePattern(instance, pattern)
}

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

  return foundPattern && foundPattern[0]
}

export function run(pattern) {
  if (!this.runned) {
    this.runned = []
  }

  this.runned.push({
    instance: this,
    at: +new Date,
    with: pattern
  })

  if (this.options.authorization && !this.options.authorization.manual) {
    this.authorize()
  }

  return initializePattern(this, pattern), this
}
