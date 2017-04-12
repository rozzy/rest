"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var auth = {
  authorize: function authorize() {
    var method = this._methods.authorize || this._adapter.methods.authorize;

    return method.call(this, this.options.authorization, this.options, this);
  },
  deauthorize: function deauthorize() {
    var method = this._methods.deauthorize || this._adapter.methods.deauthorize;

    return method.call(this, this.options.authorization, this.options, this);
  }
};

exports.default = auth;