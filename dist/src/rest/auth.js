"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var auth = {
  authorize: function authorize() {
    return this._adapter.authorize(this.options.authorization, this.options, this);
  },
  deauthorize: function deauthorize() {
    return this._adapter.deauthorize(this.options.authorization, this.options, this);
  }
};

exports.default = auth;