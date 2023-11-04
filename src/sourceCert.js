const https = require('https')
const dns = require('dns')

async function getCertificateFromSourceURL(rawHeaders) {
  const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0
  const port = 8181

  let website = rawHeaders[1].replace(`:${port}`, '')
  if (DEBUG_LEVEL >= 3) {
    website = process.env.TEST_WEBSITE
  }

  const lookupOptions = {
    family: 4,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  }

  const options = {
    hostname: website,
    port: 443,
    method: 'GET',
  }

  try {
    let address
    let cert

    address = await dns.promises.lookup(options.hostname, lookupOptions)
    console.log(`IP address: ${address.address}`)

    let attempts = 3 // Количество попыток получения сертификата
    let certError

    do {
      const req = https.request(options, (res) => {
        console.log('statusCode:', res.statusCode)
        //console.log('headers:', res.headers)

        try {
          cert = res.socket.getPeerCertificate()
          console.log('certificate:', cert)
        } catch (error) {
          certError = error
        }
        req.end()
      })

      req.on('error', (e) => {
        console.error(e)
      })

      req.end()
      await new Promise((resolve) => setTimeout(resolve, 1000))
      if (cert) {
        return cert
      }
    } while (--attempts > 0)


    if (certError) {
      throw certError
    }

    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

module.exports = getCertificateFromSourceURL 