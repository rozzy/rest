import { isObject, merge } from 'lodash'

import { isMethodRegistered, registerMethods, loadPatterns, run } from './rest/instanceMethods'
import { useAdapter, adapterIsValid } from './rest/adapterMethods'
import authModule from './rest/auth'

export default (function () {
  let defaultSettings = { // default rest settings
    adapter: null, // @string: set of rules for certain API
    threads: 1, // @integer: maximum number of threads app will have
    authorization: { // @object: authorization data for adapter API
      manual: true // @bool: doesn't try to authorize on start, when true
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
    authorize
    exposes an authorization method in case user wants to authorize before run
  */
  rest.authorize = function () {
    return this._adapter && this._adapter.methods && (
      typeof this._adapter.methods.authorize === 'function' &&
      this._adapter.methods.authorize.apply(this, arguments)
    ), this
  }

  /*
    new
    creates a new instance of the middleware with specified settings
    returns the instance
  */
  rest.new = instanceSettings => {
    if (!!instanceSettings && !isObject(instanceSettings)) {
      throw new TypeError('instanceSettings should be an object')
    }

    if (!instanceSettings) {
      instanceSettings = {}
    }

    let instance = {
      adapters: rest.adapters,
      _methods: {},
      _data: {},

      run, useAdapter, loadPatterns, registerMethods, isMethodRegistered
    }

    // extending with authorization module
    instance = merge({}, instance, authModule)
    instance.options = merge({}, defaultSettings, instanceSettings)

    if (instanceSettings.adapter) {
      instance.useAdapter(instanceSettings.adapter)
    } else {
      // in case that user wants to use just a sequencer
      // without attaching any adapters
      instance._adapter = { methods: { } }
    }

    return instance
  }

  return rest
}())
