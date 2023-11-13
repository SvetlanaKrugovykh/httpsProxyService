
async function handleRequest(req, res, netData) {
  try {
    console.log(req)
    if (req.rawHeaders[1] === netData.target_name && req.url === '/redirect.html') {
      res.writeHead(200)
      res.end()
      return
    }

    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    const Location = netData.target + 'redirect.html'
    let headerValue = req.rawHeaders[1] || ''
    headerValue = headerValue.slice(-35)

    console.log(`Request start at ${currentTime}:`, headerValue)

    res.writeHead(302, {
      'Location': Location,
    })
    res.end()
  } catch (error) {
    console.error('Error while handling request:', error)
  }
}

async function handleProxyHttpsRequest(req, res, netData) {
  try {
    if (req.rawHeaders[1] === netData.target_name && req.url === '/redirect.html') {
      res.writeHead(200)
      res.end()
      return
    }
    const currentTime = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    console.log(`Proxy request start at ${currentTime}:`, req.rawHeaders[1])

    const redirectUrl = netData.target + 'redirect.html'

    res.writeHead(302, {
      'Location': redirectUrl,
    })
    res.end()
  } catch (error) {
    console.error('Error while handling request:', error)
  }
}


module.exports = { handleRequest, handleProxyHttpsRequest }