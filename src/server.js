const https = require('https')
const httpProxy = require('http-proxy')
require('dotenv').config()
const { data, certProxy } = require('./data/netData.js')
const { handleProxyRequest } = require('./services/proxyHandler.js')
const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0
const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })

const credentialsProxy = { key: certProxy.key, cert: certProxy.cert }

for (const netData of data) {
  const proxy = httpProxy.createProxyServer({
    target: netData.target,
    changeOrigin: true,
    xfwd: true,
    secure: true,
  })

  const server = https.createServer(credentialsProxy, (req, res) => {
    handleProxyRequest(proxy, req, res, {
      target: netData.target,
      port: netData.target_port,
      secure: true,
    })
  })

  if (DEBUG_LEVEL > 0) {
    server.on('request', (req, res) => {
      console.log(`Request at ${currentTime}:`, req.url)
    })
    server.on('error', (err) => {
      console.error(`Server error at ${currentTime}:`, err)
    })
    proxy.on('error', function (err, req, res) {
      console.error(`Proxy error at ${currentTime}:`, err)
      if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
        console.error('The root CA certificate might not be trusted.')
      }
    })
  }

  if (DEBUG_LEVEL > 3) {
    proxy.on('proxyRes', function (proxyRes, req, res) {
      console.log(`Proxy response at ${currentTime}:`, req.url)
    })
  }

  server.listen(netData.port, netData.server_node, () => {
    console.log(`Proxy server listening at ${currentTime} on https://${netData.server_node}:${netData.port}`)
  })
}
