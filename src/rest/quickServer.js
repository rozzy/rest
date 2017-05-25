import fs from 'fs'
import path from 'path'
import { URL } from 'url'

import express from 'express'

let authHtmlFile = path.join(__dirname, '../assets/authorized.html')
let server = null

export function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response)

    response.setHeader("Content-Type", "text/html")
    fs.readFile(authHtmlFile, (err, html) => {
      if (err) throw err

      response.write(html)
      response.end()
    })
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
