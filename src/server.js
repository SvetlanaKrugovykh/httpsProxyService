const http = require('http')
const https = require('https')
const httpProxy = require('http-proxy')

require('dotenv').config()
const { data, certProxy, certTarget } = require('./data/netData.js')
const { handleRequest, handleProxyHttpsRequest } = require('./services/proxyHandler.js')
const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

const credentials = { key: certProxy.key, cert: certProxy.cert }

for (const netData of data) {

  const options = {
    target: netData.target,
    ssl: credentials,
    secure: false,
    changeOrigin: true,
  }

  const server_http = http.createServer((req, res) => {
    handleRequest(req, res, netData)
  })

  const proxy = httpProxy.createProxyServer(options)

  const proxyServer = https.createServer({
    ...credentials,
    ciphers: [
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'DHE-RSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-SHA256',
      'DHE-RSA-AES128-SHA256',
      'ECDHE-RSA-AES256-SHA384',
      'DHE-RSA-AES256-SHA384',
      'ECDHE-RSA-AES256-SHA256',
      'DHE-RSA-AES256-SHA256',
      'HIGH',
      '!aNULL',
      '!eNULL',
      '!EXPORT',
      '!DES',
      '!RC4',
      '!MD5',
      '!PSK',
      '!SRP',
      '!CAMELLIA'
    ].join(':'),
    secureProtocol: 'SSLv23_method',
  }, (req, res) => {
    proxy.web(req, res)
  })

  proxy.on('proxyReq', (proxyReq, req, res, options) => {
    handleProxyHttpsRequest(req, res, netData)
  })

  proxy.on('error', function (err, req, res) {
    let reqContentSnippet = ''
    if (req.body && req.body.length > 15) {
      reqContentSnippet = req.body.substring(0, 15)
    } else if (req.body) reqContentSnippet = req.body
    console.error(`Proxy on error: at ${currentTime}, Request Content: ${reqContentSnippet}...`)
  })

  proxyServer.listen(netData.port, netData.server_node, () => {
    console.log(`Proxy https server listening at ${currentTime} on https://${netData.server_node}:${netData.port}`)
  })

  server_http.listen(netData.port_http, netData.server_node, () => {
    console.log(`redirect http server listening at ${currentTime} on http://${netData.server_node}:${netData.port_http}`)
  })

}
