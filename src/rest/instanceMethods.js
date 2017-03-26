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
