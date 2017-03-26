let auth = {
  authorize() {
    return this._adapter.authorize(
      this.options.authorization,
      this.options,
      this
    )
  },

  deauthorize() {
    return this._adapter.deauthorize(
      this.options.authorization,
      this.options,
      this
    )
  }
}

export default auth
