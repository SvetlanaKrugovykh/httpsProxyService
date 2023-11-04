const https = require(`https`)
const httpProxy = require(`http-proxy`)
require(`dotenv`).config()
const { data, cert } = require(`./data/netData.js`)
const getCertificateFromSourceURL = require(`./sourceCert.js`)
const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0
const currentTime = new Date().toLocaleString('en-US', { dateStyle: `medium`, timeStyle: `short` })


const credentials = { key: cert.key, cert: cert.cert }

for (const netData of data) {
  const proxy = httpProxy.createProxyServer({
    target: netData.target,
    changeOrigin: true,
    xfwd: true,
    secure: true,
  })

  const server = https.createServer(credentials, (req, res) => {
    proxy.web(req, res, {
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
      console.error(`Proxy error at ${currentTime}:`, err);
      if (err.code === `UNABLE_TO_VERIFY_LEAF_SIGNATURE`) {
        console.error(`The root CA certificate might not be trusted.`);
      }
    })
  }

  proxy.on('proxyReq', async function (proxyReq, req, res, options) {
    try {
      const sourceCert = await getCertificateFromSourceURL(req.rawHeaders)
      console.log(`Source certificate:`, sourceCert)

      req.url = netData.target //cert.name
      console.log(`Proxy request at ${currentTime}:`, req.url)
    } catch (error) {
      console.error(`Error while getting source certificate:`, error);
    }
  })


  //#region detailedLog
  if (DEBUG_LEVEL > 3) {
    proxy.on('proxyRes', function (proxyRes, req, res) {
      console.log(`Proxy response at ${currentTime}:`, req.url)
    })
  }
  //#endregion detailedLog

  server.listen(netData.port, netData.server_node, () => {
    console.log(`Proxy server listening at ${currentTime} on https://${netData.server_node}:${netData.port}`)
  })
}
//#endregion HTTP/HTTPS

