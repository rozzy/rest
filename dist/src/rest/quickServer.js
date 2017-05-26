'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestHandlerWrapper = requestHandlerWrapper;
exports.getPathname = getPathname;
exports.createServer = createServer;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _url = require('url');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var authHtmlFile = _path2.default.join(__dirname, '../assets/authorized.html');
var server = null;

function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response);

    response.setHeader("Content-Type", "text/html");
    _fs2.default.readFile(authHtmlFile, function (err, html) {
      if (err) throw err;

      response.write(html);
      response.end();
    });
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