export function run(str) {
  this.runned = true

  console.log(this)

  return this
}

export function findAdapter(adapterName) {
  if (!adapterName) {
    throw new Error('Pass an adapter name to the "findAdapter" method')
  }

  let foundAdapterInArray = this.adapters.find(adapter => {
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

  return this._adapter = this.findAdapter(adapterName), this
}

function checkPattern(pattern) {
  if (pattern.constructor !== Object) {
    throw new TypeError('Pattern should be a plain object')
  }

  if (!pattern.hasOwnProperty('sequence')) {
    throw new TypeError('Pattern should contain the "sequence" property')
  }

  if (
    pattern.sequence == null ||
    typeof pattern.sequence !== 'object' ||
    pattern.sequence.constructor !== Array
  ) {
    throw new TypeError('"Sequence" property should be an array of actions (strings)')
  }

  checkSequences(pattern.sequence)

  return true
}

function checkAllPatterns(patterns) {
  return patterns.forEach(checkPattern)
}

export function loadPatterns(patternsGenerator) {
  let typeErrorString = 'Pass the function which returns a set of patterns to the "loadPatterns" method'
  if (!patternsGenerator || typeof patternsGenerator !== 'function') {
    throw new Error(typeErrorString)
  }

  let patterns = patternsGenerator.call(this, this.options, this)

  if (patterns.constructor !== Array) {
    throw new TypeError(typeErrorString)
  }

  checkAllPatterns(patterns)

  return this
}
