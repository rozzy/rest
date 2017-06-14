import { merge } from 'lodash'

export function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('name') || typeof adapter.name !== 'string') {
    return new Error('Adapter should contain the "name" property (string)')
  }

  if (!adapter.methods) {
    return new Error('Adapter should contain "methods" object')
  }

  if (!adapter.methods.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain "authorize" method')
  }

  if (typeof adapter.methods.authorize !== 'function') {
    return new TypeError('"authorize" method must be a function')
  }

  return true
}

export function findAdapter(adapters, adapterName) {
  if (!adapters) {
    throw new Error('There are no registered adapters')
  }

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

  let adapter = findAdapter(this.adapters, adapterName)

  this._adapter = adapter

  if (adapter.authorization) {
    this.options.authorization = merge(
      {},
      adapter.authorization,
      this.options.authorization
    )
  }

  if (adapter.methods) {
    if (!this._methods) {
      this._methods = {}
    }

    this._methods = merge({}, this._methods, adapter.methods)
  }

  return this
}
