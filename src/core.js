import { run } from './rest/instanceMethods'
import { adapterIsValid } from './rest/adapterMethods'

export default (function () {
  let rest = {} // global instance of rest
  rest.adapters = [] // list of all available adapters

  let defaultSettings = { // default rest settings
    adapter: 'custom', // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    credentials: null, // @object: authorization data for adapter API
    limits: null, // @object: set of rules to avoid bans and blocks
  }

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
    returns a new instance
  */
  rest.new = instanceSettings => {
    let instance = {
      adapters: rest.adapters,

      run
    }

    instance.options = Object.assign({}, defaultSettings, instanceSettings)

    return instance
  }

  return rest
}())
