const https = require('https')
require('dotenv').config()
const { getCertificateFromSourceURL, derToPem } = require('./sourceCert.js')
const { certTarget } = require('../data/netData.js')

async function handleProxyRequest(proxy, req, res, options) {
  try {
    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0

    console.log(`Proxy request start at ${currentTime}:`, req.rawHeaders[1])

    const destinationCerts = certTarget.cert

    const sourceCert = await getCertificateFromSourceURL(req.rawHeaders)

    if (sourceCert?.raw) {
      const sourcePemCertificate = await derToPem(sourceCert.raw)
      if (DEBUG_LEVEL > 0) console.log('sourcePemCertificate', sourcePemCertificate)

      const combinedCerts = `${sourcePemCertificate}\n${destinationCerts}`
      options.agent = new https.Agent({
        pfx: Buffer.from(combinedCerts, 'utf-8'),
      })

      // res.writeHead(302, {
      //   'Location': 'about:blank'
      // })
      res.setHeader('Referrer-Policy', 'unsafe-url')
      res.write(combinedCerts)

      res.end()
    } else {
      // Handle the case where sourceCert.raw is not available
      // You can choose to send an error response or take appropriate action.
      // For example: res.status(500).send('Error: Source certificate not available')
    }
  } catch (error) {
    console.error('Error while getting source certificate:', error)
  }
}

module.exports = { handleProxyRequest }