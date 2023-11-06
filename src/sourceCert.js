const https = require('https')
const dns = require('dns')

async function derToPem(der) {
  const base64 = Buffer.from(der).toString('base64')
  let pem = '-----BEGIN CERTIFICATE-----\n'
  pem += base64.match(/.{1,64}/g).join('\n')
  pem += '\n-----END CERTIFICATE-----\n'
  return pem
}


async function getCertificateFromSourceURL(rawHeaders) {
  const DEBUG_LEVEL = Number(process.env.DEBUG_LEVEL) || 0
  const port0 = 8080
  const port = 8181

  const website0 = rawHeaders[1].replace(`:${port0}`, '')
  let website = website0.replace(`:${port}`, '')

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
    if (DEBUG_LEVEL > 0) console.log(`IP address: ${address.address}`)

    let attempts = 3
    let certError

    do {
      const req = https.request(options, (res) => {
        try {
          cert = res.socket.getPeerCertificate()
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
        if (DEBUG_LEVEL > 0) console.log(`Got certificate for ${website}:`, cert)
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

module.exports = { getCertificateFromSourceURL, derToPem }