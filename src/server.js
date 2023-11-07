const http = require('http')
const https = require('https')
require('dotenv').config()
const { data, certProxy } = require('./data/netData.js')
const handleProxyRequest = require('./services/proxyHandler.js')
const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

const credentials = { key: certProxy.key, cert: certProxy.cert }

for (const netData of data) {

  const server = https.createServer(credentials, (req, res) => {
    handleProxyRequest(req, res, {
      target: netData.target,
      port: netData.target_port,
      secure: true,
    }, netData)
  })

  const server_http = http.createServer((req, res) => {
    handleProxyRequest(req, res, {
      target: netData.target,
      port: netData.target_port,
      secure: false,
    }, netData)
  })

  server.listen(netData.port, netData.server_node, () => {
    console.log(`Proxy https server listening at ${currentTime} on https://${netData.server_node}:${netData.port}`)
  })

  server_http.listen(netData.port_http, netData.server_node, () => {
    console.log(`Proxy http server listening at ${currentTime} on https://${netData.server_node}:${netData.port_http}`)
  })

}
