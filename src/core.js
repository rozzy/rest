import * as instanceMethods from './rest/instanceMethods'
import { adapterIsValid } from './rest/adapterMethods'
import authModule from './rest/auth'

export default (function () {
  let defaultSettings = { // default rest settings
    adapter: 'custom', // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    authorization: { // @object: authorization data for adapter API
      manual: false // @bool: tries to authorize on start, when true
    },
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

      ...instanceMethods
    }

    // extending with authorization module
    instance = Object.assign({}, instance, authModule, instanceMethods)
    instance.options = Object.assign({}, defaultSettings, instanceSettings)

    instance.useAdapter(instanceSettings.adapter)

    if (instance.options.authorization && !instance.options.authorization.manual) {
      instance.authorize()
    }

    return instance
  }

  return rest
}())
