import { isFunction, isArray, isObject } from 'lodash/core'
import { findPattern, executePattern } from './sequencer'

// registers given methods in the instance object
// then these methods could be executed in patterns
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

// registers patterns in the instance object
// then these patterns could be executed with .run method or from other patterns
export function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns
  } else if (isArray(this._patterns)) {
    this._patterns = [...this._patterns, ...patterns]
  }

  return this
}

// checks given patterns and pass them to the .registerPatterns method
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

// checks if the pattern could be executed
// then passes it to the sequencer
export function initializePattern(instance, givenPattern) {
  let pattern = findPattern(instance, givenPattern)

  return executePattern(instance, pattern)
}

// runs given pattern (array/string)
// accepts string - name of the pattern
// if string, it will look for a registered pattern with that name and try to execute it
//
// accepts array – in this case the pattern will be anonymous (anonymous pattern)
// anonymous pattern is a regular pattern, but it doesn't have a name and callbacks
// so it can not be reffered from other sequences
export function run(pattern) {
  if (!this.runned) {
    this.runned = []
  }

  this.runned.push({
    instance: this,
    at: +new Date,
    with: pattern
  })

  let authorize = () => {
    if (this.options.authorization && !this.options.authorization.manual) {
      this.authorize()
    }
  }

  if (this.options.authorization) {
    this._onAuthorize = () => {
      initializePattern(this, pattern)
    }

    return authorize(), this
  } else {
    return initializePattern(this, pattern), this
  }
}
