'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.requestHandlerWrapper = requestHandlerWrapper;
exports.createServer = createServer;
var http = require('http');
var server = null;

function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response);

    response.write("authorizing...");
    response.end();
  };
}

function createServer(requestHandler) {
  var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8080;

  console.log('server started');

  server = http.createServer(requestHandlerWrapper(requestHandler));

  server.listen(port, function (err) {
    if (err) {
      throw new Error(error);
    }
  });

  return function () {
    server.close();
  };
}

exports.default = createServer;