import { run } from './rest/instanceMethods'
import { adapterIsValid, instanceMethods } from './rest/adapterMethods'
import authModule from './rest/auth'

export default (function () {
  let defaultSettings = { // default rest settings
    adapter: 'custom', // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    authorization: null, // @object: authorization data for adapter API
    limits: null, // @object: set of rules to avoid bans and blocks
  }

  let rest = {} // global instance of rest
  rest.adapters = [] // list of all available adapters

  /*
    registerAdapter
    should be called before rest.new method
    allows to register a new API adapter
    returns global rest object to chain methods
  */
  rest.registerAdapter = adapter => {
    if (!adapter || typeof adapter !== 'function') {
      throw new TypeError('Adapter must be a function')
    }

    let constructedAdapter = adapter(rest)

    if (!constructedAdapter || typeof constructedAdapter !== 'object') {
      throw new TypeError('Adapter must return a valid object')
    }

    let adapterContainsErrors = adapterIsValid.call(rest, constructedAdapter)
    if (adapterContainsErrors instanceof Error) {
      throw adapterContainsErrors
    }

    rest.adapters = [...rest.adapters, constructedAdapter]

    return rest
  }

  /*
    new
    creates a new instance of the middleware with specified settings
    returns the instance
  */
  rest.new = instanceSettings => {
    let instance = {
      adapters: rest.adapters,

      run
    }

    // extending with authorization module
    instance = Object.assign({}, instance, authModule, instanceMethods)
    instance.options = Object.assign({}, defaultSettings, instanceSettings)

    instance.useAdapter(instanceSettings.adapter)

    return instance
  }

  return rest
}())
