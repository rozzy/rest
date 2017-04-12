import { URL } from 'url'
import express from 'express'

let server = null

export function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response)

    response.write("authorizing...")
    response.end()
  }
}

export function getPathname(url) {
  return new URL(url).pathname
}

export function createServer(redirectURI, requestHandler, port = 8080) {
  server = express()
  server.get(getPathname(redirectURI), requestHandlerWrapper(requestHandler))

  return server.listen(port)
}

export default createServer
