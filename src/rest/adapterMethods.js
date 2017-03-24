export function adapterIsValid(adapter) {
  if (!adapter.hasOwnProperty('authorize')) {
    return new Error('Adapter should contain `authorize` method')
  }

  return true
}
