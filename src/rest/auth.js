let auth = {
  authorize() {
    let method = this._methods.authorize || this._adapter.methods.authorize

    return method.call(
      this,
      this.options.authorization,
      this.options,
      this
    )
  },

  deauthorize() {
    let method = this._methods.deauthorize || this._adapter.methods.deauthorize

    return method.call(
      this,
      this.options.authorization,
      this.options,
      this
    )
  }
}

export default auth
