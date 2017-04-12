let express = require('express')
let server = null

export function requestHandlerWrapper(requestHandler) {
  return function (request, response) {
    requestHandler(request, response)

    response.write("authorizing...")
    response.end()
  }
}

export getCleanUrl(url) {
  
}

export function createServer(redirectURI, port = 8080) {
  server = express()

  server.get(getCleanUrl(redirectURI), (req, res) => {
    res.send('Admin Homepage');
  })

  server.listen(port)
}

export default createServer
