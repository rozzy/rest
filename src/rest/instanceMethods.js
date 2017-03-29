import { isFunction, isArray, isObject } from 'lodash/core'

function findAdapter(adapters, adapterName) {
  if (!adapterName) {
    throw new Error('Pass an adapter name to the "findAdapter" method')
  }

  let foundAdapterInArray = adapters.find(adapter => {
    return adapter.name === adapterName
  })

  if (!foundAdapterInArray) {
    throw new Error(`There is no adapter registered with the name "${adapterName}"`)
  }

  return foundAdapterInArray
}

export function useAdapter(adapterName) {
  if (!adapterName) {
    throw new Error('Pass an adapter name to the "useAdapter" method')
  }

  return this._adapter = findAdapter(this.adapters, adapterName), this
}

function isActionRegistered(action) {
  let isString = typeof action === 'string'

  return !this._methods || (
    isString && (
      !this._methods[action] ||
      typeof this._methods[action] !== 'function'
    )
  )
}

function checkSequenceAction(action) {
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

function checkPatternSequence(sequence, context) {
  return sequence.map(checkSequenceAction.bind(context))
}

function checkPattern(pattern) {
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

function checkAllPatterns(patterns, context) {
  return patterns.forEach(checkPattern.bind(context))
}

function registerPatterns(patterns) {
  if (!this._patterns) {
    this._patterns = patterns
  } else if (isArray(this._patterns)) {
    this._patterns = [...this._patterns, ...patterns]
  }
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

  checkAllPatterns(patterns, this)
  registerPatterns.call(this, patterns)

  return this
}

export function run(str) {
  this.runned = true

  console.log(this)

  return this
}
