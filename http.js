const http = require('http')

const server = http.createServer((_req, res) => {
  res.statusCode = 204
  res.end()
})

server.listen(8080);
