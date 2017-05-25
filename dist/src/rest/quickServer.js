'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestHandlerWrapper = requestHandlerWrapper;
exports.getPathname = getPathname;
exports.createServer = createServer;

var _url = require('url');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var server = null;

function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response);

    response.write("authorizing...");
    response.write("<script>setTimeout(window.close, 1500)</script>");
    response.end();
  };
}

function getPathname(url) {
  return new _url.URL(url).pathname;
}

function createServer(redirectURI, requestHandler) {
  var port = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 8080;

  server = (0, _express2.default)();
  server.get(getPathname(redirectURI), requestHandlerWrapper(requestHandler));

  return server.listen(port);
}

exports.default = createServer;