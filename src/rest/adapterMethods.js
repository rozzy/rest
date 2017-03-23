export function adapterIsValid(adapter) {
  if (!adapter.authorize) {
    return new Error('Adapter should contain `authorize` method');
  }

  return true
}
