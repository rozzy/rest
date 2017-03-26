export function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('name') || typeof adapter.name !== 'string') {
    return new Error('Adapter should contain the "name" property (string)')
  }

  if (!adapter.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain "authorize" method')
  }

  if (typeof adapter.authorize !== 'function') {
    return new TypeError('"authorize" method must be a function')
  }

  return true
}

export function findAdapter(adapterName) {
  let foundAdapterInArray = this.adapters.find(adapter => {
    return adapter.name === adapterName
  })

  if (!foundAdapterInArray) {
    throw new Error(`There is no adapter registered with the name "${adapterName}"`)
  }

  return foundAdapterInArray
}

export function useAdapter(adapterName) {
  return this._adapter = this.findAdapter(adapterName), this
}

export const instanceMethods = {
  findAdapter, useAdapter,
}
